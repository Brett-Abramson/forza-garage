import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const cars = await prisma.car.findMany({ orderBy: [{ make: 'asc' }, { model: 'asc' }] })
  return NextResponse.json(cars)
}
