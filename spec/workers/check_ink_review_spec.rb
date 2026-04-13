require "rails_helper"

describe CheckInkReview do
  it "delegates to InkReviewChecker for the given review" do
    review = create(:ink_review)
    checker = instance_double(InkReviewChecker, perform: nil)
    expect(InkReviewChecker).to receive(:new).with(review).and_return(checker)
    expect(checker).to receive(:perform)
    described_class.new.perform(review.id)
  end

  it "is a no-op when the review no longer exists" do
    expect(InkReviewChecker).not_to receive(:new)
    expect { described_class.new.perform(0) }.not_to raise_error
  end
end
