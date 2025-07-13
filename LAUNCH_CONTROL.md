# 🚀 Launch Control System

This system allows you to control when your application shows the countdown page vs. the main application.

## Environment Variables

Add these to your `.env.local` (for development) and Railway environment variables (for production):

```bash
# Launch Configuration
NEXT_PUBLIC_LAUNCH_DATE=2025-07-18T12:00:00Z  # Friday launch date
NEXT_PUBLIC_LAUNCH_MODE=countdown              # Options: countdown, live
```

## Launch Modes

### `countdown` Mode
- Shows the animated countdown page before launch
- Automatically switches to main app after launch date
- Perfect for building anticipation

### `live` Mode  
- Always shows the main application
- Bypasses countdown completely
- Use this for normal operation

## How to Launch on Friday

### Before Launch (Now until Friday):
1. Set environment variables:
   ```bash
   NEXT_PUBLIC_LAUNCH_DATE=2025-07-18T12:00:00Z  # Adjust time as needed
   NEXT_PUBLIC_LAUNCH_MODE=countdown
   ```

2. Deploy to Railway with these settings
3. Your site will show the countdown page

### On Launch Day (Friday):
**Option 1: Automatic (Recommended)**
- The app will automatically switch to the main application when the countdown reaches zero
- No action needed from you!

**Option 2: Manual Control**
- Change the launch mode to skip countdown:
  ```bash
  NEXT_PUBLIC_LAUNCH_MODE=live
  ```
- Redeploy to Railway

## Testing the System

### To test countdown page:
```bash
# Set future date and countdown mode
NEXT_PUBLIC_LAUNCH_DATE=2025-12-31T23:59:59Z
NEXT_PUBLIC_LAUNCH_MODE=countdown
```

### To test main app:
```bash
# Set past date or live mode
NEXT_PUBLIC_LAUNCH_DATE=2025-01-01T00:00:00Z
NEXT_PUBLIC_LAUNCH_MODE=live
```

## Railway Setup

1. Go to your Railway project dashboard
2. Click on "Variables" tab
3. Add the launch configuration variables
4. Deploy the changes

The system will automatically handle:
- ✅ Countdown display with animations
- ✅ Real-time countdown updates
- ✅ Automatic switching to main app
- ✅ Email signup for launch notifications
- ✅ Beautiful animated interface

## Features of the Countdown Page

- 🎨 **Beautiful Animations**: Floating particles, rotating elements
- ⏰ **Live Countdown**: Real-time updating timer
- 📧 **Email Signup**: Collect emails for launch notifications  
- 📱 **Responsive Design**: Looks great on all devices
- 🌟 **Interactive Elements**: Hover effects and smooth transitions
- 🚀 **Feature Preview**: Showcase what's coming

Your launch is going to be amazing! 🎉
