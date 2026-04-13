class EnqueueInkReviewChecks
  include Sidekiq::Worker

  sidekiq_options queue: "low"

  BATCH_SIZE = 100
  STAGGER_INTERVAL = 36 # seconds between enqueued jobs (~1 hour for full batch)

  def perform
    InkReview
      .due_for_check
      .order(:next_check_at)
      .limit(BATCH_SIZE)
      .pluck(:id)
      .each_with_index { |id, i| CheckInkReview.perform_in((i * STAGGER_INTERVAL).seconds, id) }
  end
end
