import { experimental_upgradeWebSocket } from '@vercel/functions';
import { registerWorldSocket } from '@/lib/world-multiplayer';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export function GET() {
  return experimental_upgradeWebSocket(registerWorldSocket, { maxPayload: 2_048 });
}
