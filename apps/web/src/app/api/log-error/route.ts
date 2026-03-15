import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = await request.json();

  process.stdout.write(
    JSON.stringify({
      level: 'error',
      time: Date.now(),
      context: 'ClientError',
      msg: `Client error: ${body.message ?? 'unknown'}`,
      ...body,
    }) + '\n',
  );

  return NextResponse.json(null, { status: 200 });
}
