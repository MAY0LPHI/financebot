# WhatsApp Pairing Console

## Overview

The WhatsApp Pairing Console is a dedicated interface for connecting WhatsApp devices to the FinBot application. It provides a streamlined workflow for generating QR codes and pairing codes to authenticate WhatsApp sessions.

## Location

The console is accessible at: `/admin/whatsapp-pairing`

## Features

### 1. Session Initialization
- Click "Generate QR Code & Pairing Code" to create a new WhatsApp session
- The session is automatically named `pairing-console`
- Real-time status updates via WebSocket

### 2. QR Code Authentication
- Displays a scannable QR code (as a data URL image)
- Instructions for scanning with WhatsApp mobile app
- Automatic refresh when new QR code is generated

### 3. Pairing Code Authentication
- Alternative to QR code scanning
- Enter phone number (with country code)
- Request a pairing code to enter manually in WhatsApp
- Useful for devices where QR scanning is difficult

### 4. Status Monitoring
- Real-time connection status indicator
- States: Disconnected, Connecting, QR Ready, Authenticated, Connected
- WebSocket connection status indicator

### 5. User Feedback
- Loading states during session initialization
- Error messages for failed operations
- Success confirmation when connected

## API Endpoints Used

### Backend Endpoints

#### Initialize Session
```
POST /whatsapp/init
Body: { sessionName: string }
Response: { success: boolean, message: string }
```

#### Get QR Code
```
GET /whatsapp/qr/:sessionName
Response: { qrCode: string } // Data URL (image/png base64)
```

#### Request Pairing Code
```
POST /whatsapp/pair/:sessionName
Body: { phoneNumber: string }
Response: { pairingCode: string }
```

#### Get Session Status
```
GET /whatsapp/status/:sessionName
Response: { 
  status: WhatsAppStatus, 
  qrCode: string | null, 
  pairingCode: string | null 
}
```

## WebSocket Events

The console subscribes to the following WebSocket events:

- `status-update`: Session status changes
- `qr-code`: New QR code generated
- `session-connected`: Session successfully connected
- `session-disconnected`: Session disconnected

## Usage Instructions

### Using QR Code:
1. Click "Generate QR Code & Pairing Code" button
2. Open WhatsApp on your phone
3. Go to Settings → Linked Devices
4. Tap "Link a Device"
5. Scan the QR code displayed

### Using Pairing Code:
1. Click "Generate QR Code & Pairing Code" button
2. Enter your phone number (with country code) in the field
3. Click "Request Code" to generate a pairing code
4. Open WhatsApp on your phone
5. Go to Settings → Linked Devices → Link a Device → Link with Phone Number
6. Enter the pairing code displayed

## Technical Details

### Frontend Implementation
- Located at: `frontend/src/app/admin/whatsapp-pairing/page.tsx`
- Uses React hooks for state management
- Real-time updates via Socket.io
- Responsive design with Tailwind CSS
- shadcn/ui components for consistent styling

### Backend Implementation
- QR codes are converted to data URLs using the `qrcode` package
- Session data is stored in PostgreSQL via Prisma
- Real-time updates via WebSocket gateway
- Uses whatsapp-web.js for WhatsApp integration

### Security
- Protected by JWT authentication
- Admin-only access via AdminGuard
- Rate limiting applied to API endpoints

## Troubleshooting

### QR Code Not Displaying
- Ensure the session is initialized (check status)
- Wait 2-3 seconds after initialization for QR generation
- Check browser console for errors
- Verify WebSocket connection is active

### Pairing Code Not Working
- Ensure phone number includes country code (e.g., 5511999999999)
- Session must be in QR_READY state to request pairing code
- Code expires after a short time, request a new one if needed

### Connection Fails
- Check that backend services (Redis, PostgreSQL) are running
- Verify WhatsApp Web.js Chromium dependency is installed
- Check backend logs for authentication errors
- Ensure only one session is active per WhatsApp account

## Related Files

- Frontend: `frontend/src/app/admin/whatsapp-pairing/page.tsx`
- Backend Controller: `backend/src/whatsapp/whatsapp.controller.ts`
- Backend Service: `backend/src/whatsapp/whatsapp.service.ts`
- Backend Gateway: `backend/src/whatsapp/whatsapp.gateway.ts`
- API Client: `frontend/src/lib/api.ts` (whatsappApi)
- Socket Client: `frontend/src/lib/socket.ts`

## Future Enhancements

Potential improvements:
- Multi-session support with session naming
- Session management (disconnect, delete from console)
- QR code refresh button
- Session history and logging
- Automatic reconnection on disconnect
