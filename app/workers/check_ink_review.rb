class CheckInkReview
  include Sidekiq::Worker
  include Sidekiq::Throttled::Worker

  sidekiq_throttle concurrency: { limit: 3 }
  sidekiq_options queue: "reviews"

  def perform(id)
    review = InkReview.find_by(id:)
    return unless review

    InkReviewChecker.new(review).perform
  end
end
