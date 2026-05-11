import { NextResponse } from 'next/server'

import { API_URL } from '@/src/api/url'

type RouteContext = {
  params: Promise<{
    showtimeId: string
  }>
}

export async function GET(_request: Request, context: RouteContext) {
  const { showtimeId } = await context.params
  const url = `${API_URL}/api/v1/showtimes/${encodeURIComponent(showtimeId)}/seats`

  try {
    const response = await fetch(url, {
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
      },
    })

    const contentType = response.headers.get('content-type') || ''
    const data = contentType.includes('application/json')
      ? await response.json()
      : await response.text()

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Failed to proxy showtime seats:', error)

    return NextResponse.json(
      {
        success: false,
        message: 'Không thể kết nối đến máy chủ ghế ngồi.',
      },
      { status: 502 },
    )
  }
}
