import { redirect } from 'next/navigation'

interface Props {
  searchParams: Promise<{ tags?: string }>
}

export default async function GarageRedirect({ searchParams }: Props) {
  const { tags } = await searchParams
  redirect(tags ? `/?tags=${tags}` : '/')
}
