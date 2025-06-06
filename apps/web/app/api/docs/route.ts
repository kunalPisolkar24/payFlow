import { NextResponse } from 'next/server';
import swaggerSpec from '@/lib/swagger';

export async function GET() {
  return NextResponse.json(swaggerSpec, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}