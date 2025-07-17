
// Firebase Payment Service for TicketFlow
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  serverTimestamp,
  writeBatch,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import type { 
  CreatorPaymentProfile, 
  Transaction, 
  Payout, 
  RefundRequest,
  PaymentSplit,
  PaymentAnalytics 
} from './payment-types';
import { PaymentCalculator } from './payment-config';

export class FirebasePaymentService {
  
  // Payment Profile Management
  static async getPaymentProfile(userId: string): Promise<CreatorPaymentProfile | null> {
    try {
      const profileRef = doc(db, 'users', userId, 'paymentProfile', 'main');
      const profileSnap = await getDoc(profileRef);
      
      if (profileSnap.exists()) {
        const data = profileSnap.data();
        return {
          ...data,
          userId,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        } as unknown as CreatorPaymentProfile;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting payment profile:', error);
      throw error;
    }
  }

  static async savePaymentProfile(profile: CreatorPaymentProfile): Promise<void> {
    try {
      const profileRef = doc(db, 'users', profile.userId, 'paymentProfile', 'main');
      
      // Check if profile already exists
      const existingProfile = await getDoc(profileRef);
      const updateData: any = {
        ...profile,
        updatedAt: serverTimestamp(),
      };
      
      // Only set createdAt if this is a new profile
      if (!existingProfile.exists()) {
        updateData.createdAt = serverTimestamp();
      }
      
      await setDoc(profileRef, updateData, { merge: true });
      
    } catch (error) {
      console.error('Error saving payment profile:', error);
      throw error;
    }
  }

  static async updatePaymentProfile(
    userId: string, 
    updates: Partial<CreatorPaymentProfile>
  ): Promise<void> {
    try {
      const profileRef = doc(db, 'users', userId, 'paymentProfile', 'main');
      
      // Filter out undefined values and handle timestamp fields
      const updateData: any = {};
      Object.entries(updates).forEach(([key, value]) => {
        if (value !== undefined) {
          updateData[key] = value;
        }
      });
      
      updateData.updatedAt = serverTimestamp();
      
      await updateDoc(profileRef, updateData);
      
    } catch (error) {
      console.error('Error updating payment profile:', error);
      throw error;
    }
  }

  // Transaction Management
  static async createTransaction(
    ticketId: string,
    eventId: string,
    creatorId: string,
    amount: number,
    gatewayId: 'mtn-momo',
    paymentSplit: PaymentSplit,
    metadata?: Record<string, any>
  ): Promise<string> {
    try {
      const transactionRef = doc(collection(db, 'transactions'));
      
      const transaction: Omit<Transaction, 'id'> = {
        ticketId,
        eventId,
        creatorId,
        amount,
        currency: 'GHS',
        paymentGateway: gatewayId,
        gatewayTransactionId: '',
        status: 'pending',
        paymentSplit,
        createdAt: new Date().toISOString(),
        metadata: metadata || {},
      };

      await setDoc(transactionRef, {
        ...transaction,
        createdAt: serverTimestamp(),
      });
      
      return transactionRef.id;
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  }

  static async updateTransaction(
    transactionId: string, 
    updates: Partial<Transaction>
  ): Promise<void> {
    try {
      const transactionRef = doc(db, 'transactions', transactionId);
      
      const updateData: any = { ...updates };
      
      if (updates.status === 'completed' && !updates.completedAt) {
        updateData.completedAt = serverTimestamp();
      }
      
      if (updates.status === 'refunded' && !updates.refundedAt) {
        updateData.refundedAt = serverTimestamp();
      }
      
      await updateDoc(transactionRef, updateData);
      
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  }

  static async getTransaction(transactionId: string): Promise<Transaction | null> {
    try {
      const transactionRef = doc(db, 'transactions', transactionId);
      const transactionSnap = await getDoc(transactionRef);
      
      if (transactionSnap.exists()) {
        const data = transactionSnap.data();
        return {
          id: transactionSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          completedAt: data.completedAt?.toDate?.()?.toISOString(),
          refundedAt: data.refundedAt?.toDate?.()?.toISOString(),
        } as Transaction;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting transaction:', error);
      throw error;
    }
  }

  static async getCreatorTransactions(
    creatorId: string, 
    limitCount: number = 50
  ): Promise<Transaction[]> {
    try {
      const transactionsQuery = query(
        collection(db, 'transactions'),
        where('creatorId', '==', creatorId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(transactionsQuery);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          completedAt: data.completedAt?.toDate?.()?.toISOString(),
          refundedAt: data.refundedAt?.toDate?.()?.toISOString(),
        } as Transaction;
      });
    } catch (error) {
      console.error('Error getting creator transactions:', error);
      throw error;
    }
  }

  // Payout Management
  static async createPayout(
    creatorId: string,
    amount: number,
    transactionIds: string[],
    paymentMethod: string,
    scheduledDate: Date
  ): Promise<string> {
    try {
      const payoutRef = doc(collection(db, 'payouts'));
      
      const payout: Omit<Payout, 'id'> = {
        creatorId,
        amount,
        currency: 'GHS',
        status: 'pending',
        paymentMethod: paymentMethod as any,
        transactionIds,
        scheduledDate: scheduledDate.toISOString(),
      };

      await setDoc(payoutRef, {
        ...payout,
        scheduledDate: Timestamp.fromDate(scheduledDate),
        createdAt: serverTimestamp(),
      });
      
      return payoutRef.id;
    } catch (error) {
      console.error('Error creating payout:', error);
      throw error;
    }
  }

  static async updatePayout(payoutId: string, updates: Partial<Payout>): Promise<void> {
    try {
      const payoutRef = doc(db, 'payouts', payoutId);
      
      const updateData: any = { ...updates };
      
      if (updates.status === 'completed' && !updates.processedDate) {
        updateData.processedDate = serverTimestamp();
      }
      
      await updateDoc(payoutRef, updateData);
      
    } catch (error) {
      console.error('Error updating payout:', error);
      throw error;
    }
  }

  static async getPendingPayouts(schedule?: string): Promise<Payout[]> {
    try {
      let payoutsQuery = query(
        collection(db, 'payouts'),
        where('status', '==', 'pending'),
        where('scheduledDate', '<=', Timestamp.now())
      );

      if (schedule) {
        // Note: You'd need to add payoutSchedule field to payout docs
        // or join with user payment profiles to filter by schedule
      }

      const querySnapshot = await getDocs(payoutsQuery);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          scheduledDate: data.scheduledDate?.toDate?.()?.toISOString() || new Date().toISOString(),
          processedDate: data.processedDate?.toDate?.()?.toISOString(),
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        } as Payout;
      });
    } catch (error) {
      console.error('Error getting pending payouts:', error);
      throw error;
    }
  }

  static async getCreatorPayouts(
    creatorId: string, 
    limitCount: number = 20
  ): Promise<Payout[]> {
    try {
      const payoutsQuery = query(
        collection(db, 'payouts'),
        where('creatorId', '==', creatorId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(payoutsQuery);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          scheduledDate: (data.scheduledDate && typeof data.scheduledDate.toDate === 'function')
            ? data.scheduledDate.toDate().toISOString()
            : (typeof data.scheduledDate === 'string' ? data.scheduledDate : new Date().toISOString()),
          processedDate: (data.processedDate && typeof data.processedDate.toDate === 'function')
            ? data.processedDate.toDate().toISOString()
            : (typeof data.processedDate === 'string' ? data.processedDate : undefined),
          createdAt: (data.createdAt && typeof data.createdAt.toDate === 'function')
            ? data.createdAt.toDate().toISOString()
            : (typeof data.createdAt === 'string' ? data.createdAt : new Date().toISOString()),
        } as Payout;
      });
    } catch (error) {
      console.error('Error getting creator payouts:', error);
      throw error;
    }
  }

  // Analytics and Reporting
  static async getCreatorAnalytics(
    creatorId: string,
    startDate: Date,
    endDate: Date
  ): Promise<PaymentAnalytics> {
    try {
      const transactionsQuery = query(
        collection(db, 'transactions'),
        where('creatorId', '==', creatorId),
        where('createdAt', '>=', Timestamp.fromDate(startDate)),
        where('createdAt', '<=', Timestamp.fromDate(endDate)),
        where('status', '==', 'completed')
      );
      
      const querySnapshot = await getDocs(transactionsQuery);
      
      let totalRevenue = 0;
      let platformCommission = 0;
      let adminCommission = 0;
      let creatorPayouts = 0;
      let processingFees = 0;
      let refunds = 0;
      
      const gatewayBreakdown: any = {};
      
      querySnapshot.docs.forEach(doc => {
        const transaction = doc.data() as Transaction;
        const split = transaction.paymentSplit;
        
        totalRevenue += split.ticketPrice;
        platformCommission += split.platformCommission;
        adminCommission += split.adminCommission;
        creatorPayouts += split.creatorPayout;
        processingFees += split.paymentProcessingFee;
        
        // Gateway breakdown
        const gateway = transaction.paymentGateway;
        if (!gatewayBreakdown[gateway]) {
          gatewayBreakdown[gateway] = { volume: 0, transactions: 0, fees: 0 };
        }
        
        gatewayBreakdown[gateway].volume += split.ticketPrice;
        gatewayBreakdown[gateway].transactions += 1;
        gatewayBreakdown[gateway].fees += split.paymentProcessingFee;
      });
      
      return {
        totalRevenue,
        platformCommission,
        adminCommission,
        creatorPayouts,
        processingFees,
        refunds,
        period: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
        },
        gatewayBreakdown,
      };
      
    } catch (error) {
      console.error('Error getting creator analytics:', error);
      throw error;
    }
  }

  // Balance Management
  static async getCreatorBalance(creatorId: string): Promise<{
    available: number;
    pending: number;
    total: number;
  }> {
    try {
      // Get completed transactions that haven't been paid out yet
      const completedQuery = query(
        collection(db, 'transactions'),
        where('creatorId', '==', creatorId),
        where('status', '==', 'completed')
      );
      
      const completedSnapshot = await getDocs(completedQuery);
      
      // Get all payouts for this creator
      const payoutsQuery = query(
        collection(db, 'payouts'),
        where('creatorId', '==', creatorId),
        where('status', 'in', ['completed', 'processing'])
      );
      
      const payoutsSnapshot = await getDocs(payoutsQuery);
      
      // Calculate total earned
      let totalEarned = 0;
      const allTransactionIds = new Set<string>();
      
      completedSnapshot.docs.forEach(doc => {
        const transaction = doc.data() as Transaction;
        totalEarned += transaction.paymentSplit.creatorPayout;
        allTransactionIds.add(doc.id);
      });
      
      // Calculate already paid out
      let totalPaidOut = 0;
      const paidOutTransactionIds = new Set<string>();
      
      payoutsSnapshot.docs.forEach(doc => {
        const payout = doc.data() as Payout;
        totalPaidOut += payout.amount;
        payout.transactionIds.forEach(id => paidOutTransactionIds.add(id));
      });
      
      // Calculate pending (completed but not yet paid out)
      let pending = 0;
      completedSnapshot.docs.forEach(doc => {
        if (!paidOutTransactionIds.has(doc.id)) {
          const transaction = doc.data() as Transaction;
          pending += transaction.paymentSplit.creatorPayout;
        }
      });
      
      const available = totalEarned - totalPaidOut;
      
      return {
        available: Math.max(0, available),
        pending,
        total: totalEarned,
      };
      
    } catch (error) {
      console.error('Error getting creator balance:', error);
      throw error;
    }
  }

  // Refund Management
  static async createRefundRequest(
    transactionId: string,
    ticketId: string,
    amount: number,
    reason: string,
    requestedBy: string
  ): Promise<string> {
    try {
      const refundRef = doc(collection(db, 'refundRequests'));
      
      const refundRequest: Omit<RefundRequest, 'id'> = {
        transactionId,
        ticketId,
        amount,
        reason,
        status: 'pending',
        requestedBy,
        requestDate: new Date().toISOString(),
        refundMethod: 'original_payment',
      };

      await setDoc(refundRef, {
        ...refundRequest,
        requestDate: serverTimestamp(),
      });
      
      return refundRef.id;
    } catch (error) {
      console.error('Error creating refund request:', error);
      throw error;
    }
  }

  static async updateRefundRequest(
    refundId: string, 
    updates: Partial<RefundRequest>
  ): Promise<void> {
    try {
      const refundRef = doc(db, 'refundRequests', refundId);
      
      const updateData: any = { ...updates };
      
      if (updates.status && ['approved', 'denied', 'processed'].includes(updates.status)) {
        updateData.processDate = serverTimestamp();
      }
      
      await updateDoc(refundRef, updateData);
      
    } catch (error) {
      console.error('Error updating refund request:', error);
      throw error;
    }
  }
}
