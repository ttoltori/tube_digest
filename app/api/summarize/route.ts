import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { summarizeVideo } from '@/lib/openai'

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { videoId, title, description, channelTitle, language, lengthType = 'short' } = body

    if (!videoId || !title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check for existing summary
    const { data: existing } = await supabase
      .from('summaries')
      .select('*')
      .eq('video_id', videoId)
      .eq('user_id', user.id)
      .eq('length_type', lengthType)
      .single()

    if (existing) {
      return NextResponse.json({
        id: existing.id,
        summary: existing.summary_ko,
        keyPoints: existing.key_points,
        readingTime: existing.reading_time,
      })
    }

    // Ensure video is cached
    const { error: videoUpsertError } = await supabase.from('videos').upsert(
      {
        id: videoId,
        channel_id: 'unknown',
        channel_title: channelTitle || '',
        title,
        description: description || '',
        language: language || 'ko',
      },
      { onConflict: 'id', ignoreDuplicates: true }
    )

    if (videoUpsertError) {
      console.error('Video upsert error:', videoUpsertError)
    }

    // Generate AI summary
    const result = await summarizeVideo(title, description || '', channelTitle || '', language || 'ko', lengthType)

    // Store summary
    const { data: savedSummary } = await supabase
      .from('summaries')
      .insert({
        video_id: videoId,
        user_id: user.id,
        summary_ko: result.summary,
        key_points: result.keyPoints,
        reading_time: result.readingTime,
        length_type: lengthType,
      })
      .select()
      .single()

    // Update user stats
    const durationEstimate = 30 // minutes saved estimate
    try {
      await supabase.rpc('increment_profile_stats', {
        user_id: user.id,
        time_saved: durationEstimate,
      })
    } catch {
      // RPC might not exist yet; ignore
    }

    return NextResponse.json({
      id: savedSummary?.id,
      summary: result.summary,
      keyPoints: result.keyPoints,
      readingTime: result.readingTime,
    })
  } catch (error) {
    console.error('Summarize API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
