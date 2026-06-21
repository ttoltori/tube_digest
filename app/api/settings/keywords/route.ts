import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { keyword } = await req.json()

    if (!keyword?.trim()) {
      return NextResponse.json({ error: 'Keyword required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('keywords')
      .insert({ user_id: user.id, keyword: keyword.trim() })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: '이미 등록된 키워드입니다.' }, { status: 409 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ keyword: data })
  } catch (error) {
    console.error('Keywords POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
