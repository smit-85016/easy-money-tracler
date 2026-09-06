# Pocket Ledger

Build a minimal, modern, premium-looking personal money tracker mobile app for daily use.

The app should be simple enough that I can record a transaction in a few seconds.

Do NOT make it a complex finance/accounting app.

Main Goal

I want to quickly know:

How much money I currently have

How much I spent

Where I spent it

How much money friends owe me

How much I owe friends

Everything will be entered manually.

Core Features Only

1. Home Screen

Show a clean premium dashboard with:

Available Balance

Example:

₹4,850

Below it show three small cards:

Spent This Month

To Receive

To Pay

Also show recent transactions.

2. Add Money

Allow me to enter:

Amount

Source

Account

Optional note

Example:

₹3,000
From Home

This should increase my balance.

3. Add Expense

Make this extremely fast.

Main flow:

Enter Amount → Select Category → Save

Example:

₹900
Shopping
Power Bank

Balance should automatically decrease.

Optional fields:

Description

Account

Date

Note

Keep optional fields hidden under “More Details”.

4. Categories

Use simple modern icons for:

Food

Shopping

Grocery

Travel

College

Recharge/Bills

Entertainment

Health

Electronics

Other

Allow custom category if needed.

5. Friend Split

Example:

Dinner bill = ₹600

I paid ₹600.

My share = ₹300.

Friend share = ₹300.

App should show:

Available balance decreases by ₹600.

And separately:

₹300 To Receive

Do not add the ₹300 back to available balance until the friend actually pays me.

6. Friend Tracker

Create a simple Friends screen.

Example:

Rahul
₹300 To Receive

Yash
₹200 To Pay

Tap a friend to see simple payment history.

Add a:

Settle

button.

7. Reminder

Allow me to set a reminder for pending friend payments.

Options:

Tomorrow

3 Days

7 Days

Custom Date

Use local notifications.

8. Transactions

Show all transactions in a clean timeline.

Example:

Today

Shopping
Power Bank
−₹900

Food
Dinner
−₹600
₹300 recoverable

Money Received
From Home
+₹3,000

Allow edit and delete.

9. Accounts

Only support simple accounts:

Bank

Cash

Optional:

Wallet

Show total available money from all accounts.

Allow transfer between Bank and Cash.

Transfers must NOT count as income or expense.

10. Simple Monthly Summary

Show only useful information:

Total Received

Total Spent

Remaining Balance

Top Spending Category

Add one simple spending chart.

Do NOT add complicated analytics.

UI STYLE

This is very important.

The app must look:

modern

premium

minimal

futuristic

clean

smooth

elegant

Take inspiration from modern iPhone/iOS design principles:

excellent typography

soft rounded cards

clean spacing

subtle blur/transparency

smooth animations

premium icons

light and dark mode

subtle haptic feedback

Do NOT directly copy Apple.

Create an original premium design.

Avoid:

too many colors

excessive neon

clutter

unnecessary gradients

huge dashboards

complex charts

too much text

The app should look impressive when opened in front of other people, but still remain simple.

Navigation

Use only 4 main sections:

Home | Transactions | Friends | Insights

Use one floating + button.

When tapped show:

Add Expense

Add Money

Split Bill

Transfer

Important Accounting Logic

Keep these values separate:

Available Balance

To Receive

To Pay

Example:

Available = ₹2,000

Friend owes me = ₹500

I owe friend = ₹200

Show:

Available ₹2,000

To Receive ₹500

To Pay ₹200

Do NOT show ₹2,500 as available.

Technical Requirements

Build it in Flutter.

Use local storage/database.

The app should work fully offline.

No login required.

No bank integration.

No Firebase required.

Use local notifications for reminders.

Use integer values for money calculations, not floating-point numbers.

Keep the project architecture clean but NOT over-engineered.

Development Rule

Do not create 50 screens.

Do not add extra features unless absolutely necessary.

Focus on making these few features work perfectly.

First build:

Home

Add Money

Add Expense

Transactions

Friend Split

Friends

Reminders

Simple Insights

Settings

Then polish the UI.

The final result should feel like:

a beautifully designed personal money notebook for daily life.

Not accounting software.

Not a business finance app.

Not a complicated budgeting system.

Start by showing me:

Simple screen structure

Database structure

UI design system

Then begin implementing the Flutter app.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://easy-money-tracler.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/1ca10ac1-691c-4f44-aae9-f5fc4cb49e1b).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
