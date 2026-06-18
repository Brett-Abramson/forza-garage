import { NextRequest, NextResponse } from 'next/server'
import { getCarById } from '@/server/dal/cars'

// Read-only single-car endpoint. The drawer fetches this on open to fill in the
// spec-only fields (engineType, engineCC, cylinders, bodyStyle) that the list
// projection omits. All mutations now live in @/server/actions/garage.
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const carId = parseInt(id)
  if (isNaN(carId)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

  const car = await getCarById(carId)
  if (!car) return NextResponse.json({ error: 'Car not found' }, { status: 404 })
  return NextResponse.json(car)
}
