
// Payout Scheduler Logic
import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import { db } from './firebase';
import { FirebasePaymentService } from './firebase-payment-service';
import type { UserProfile } from './types';
import type { CreatorPaymentProfile } from './payment-types';
import { add, startOfToday } from 'date-fns';

export class PayoutScheduler {
  
  static async processDuePayouts(): Promise<{ processed: number, errors: number }> {
    console.log("Starting payout processing job...");
    
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const allUsers = usersSnapshot.docs.map(d => ({...d.data(), uid: d.id} as UserProfile));

    let processedCount = 0;
    let errorCount = 0;

    for (const user of allUsers) {
      if (!user.paymentProfileCompleted) {
        continue;
      }
      
      try {
        const paymentProfile = await FirebasePaymentService.getPaymentProfile(user.uid);
        if (!paymentProfile) continue;

        if (this.isPayoutDue(paymentProfile)) {
          const success = await this.processCreatorPayout(user.uid, paymentProfile);
          if (success) {
            processedCount++;
          }
        }
      } catch (error) {
        console.error(`Failed to process payout for user ${user.uid}:`, error);
        errorCount++;
      }
    }
    
    console.log(`Payout processing finished. Processed: ${processedCount}, Errors: ${errorCount}`);
    return { processed: processedCount, errors: errorCount };
  }

  private static isPayoutDue(profile: CreatorPaymentProfile): boolean {
    const today = startOfToday();
    const lastPayoutDate = profile.lastPayoutDate ? new Date(profile.lastPayoutDate) : new Date(0);
    let nextDueDate: Date;

    switch(profile.payoutSchedule) {
      case 'daily':
        nextDueDate = add(lastPayoutDate, { days: 1 });
        break;
      case 'weekly':
        nextDueDate = add(lastPayoutDate, { weeks: 1 });
        break;
      case 'monthly':
        nextDueDate = add(lastPayoutDate, { months: 1 });
        break;
      default:
        return false;
    }

    return today >= nextDueDate;
  }

  private static async processCreatorPayout(
    creatorId: string,
    profile: CreatorPaymentProfile
  ): Promise<boolean> {
    const unpaidTxs = await FirebasePaymentService.getUnpaidCompletedTransactions(creatorId);
    
    if (unpaidTxs.length === 0) {
      return false; // No transactions to pay out
    }
    
    const totalPayoutAmount = unpaidTxs.reduce((sum, tx) => sum + tx.paymentSplit.creatorPayout, 0);

    if (totalPayoutAmount < profile.minimumPayoutAmount) {
      console.log(`Skipping payout for ${creatorId}: below minimum of ${profile.minimumPayoutAmount}. Current: ${totalPayoutAmount}`);
      return false;
    }

    const transactionIds = unpaidTxs.map(tx => tx.id);
    const scheduledDate = new Date();

    const payoutId = await FirebasePaymentService.createPayout(
      creatorId,
      totalPayoutAmount,
      transactionIds,
      'momo',
      scheduledDate
    );

    // Update last payout date on profile
    await FirebasePaymentService.updatePaymentProfile(creatorId, {
      lastPayoutDate: scheduledDate.toISOString()
    });

    console.log(`Created payout ${payoutId} for creator ${creatorId} amounting to ${totalPayoutAmount}`);
    return true;
  }
}
