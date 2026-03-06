# Frontend (MEDIX)
React + Vite frontend for the MEDIX healthcare platform.

## Run Locally
```bash
npm install
npm run dev
```
Dev server: `http://localhost:5173`

## Build
```bash
npm run build
npm run preview
```

## Environment Variables
Create `frontend/.env`:
```env
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
```

## App Routes
- `/login`
- `/register`
- `/verify/:userId`
- `/admin`
- `/doctor`
- `/nurse`
- `/patient`

## Main Folders
- `src/components`: shared UI pieces
- `src/context`: auth/app state providers
- `src/pages`: role-based dashboards and auth pages
- `src/services`: API/email/pdf helper services
