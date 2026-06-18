import { NextResponse } from 'next/server'
import { getAllCars } from '@/server/dal/cars'

// Public, read-only list of every car. Mutations live in @/server/actions/garage.
export async function GET() {
  const cars = await getAllCars()
  return NextResponse.json(cars)
}
