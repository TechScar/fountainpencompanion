require "rails_helper"

describe InkReview do
  it "fails validation if the title is missing" do
    expect(subject).not_to be_valid
    expect(subject.errors).to include(:title)
  end

  it "fails validation if the url is missing" do
    expect(subject).not_to be_valid
    expect(subject.errors).to include(:url)
  end

  it "fails validation if the image is missing" do
    expect(subject).not_to be_valid
    expect(subject.errors).to include(:image)
  end

  it "fails validation if the macro cluster association is missing" do
    expect(subject).not_to be_valid
    expect(subject.errors).to include(:macro_cluster)
  end

  it "fails validation if it is not a valid url" do
    subject.url = "weeeeeeee"
    expect(subject).not_to be_valid
    expect(subject.errors).to include(:url)
  end

  it "fails validation if url is a blank string" do
    subject.url = "          "
    expect(subject).not_to be_valid
    expect(subject.errors).to include(:url)
  end

  it "sets host automatically from the url" do
    subject.url = "https://example.com/some/page"
    expect(subject.host).to eq("example.com")
  end

  describe "approve/reject methods manage check state" do
    let(:review) do
      create(:ink_review, check_count: 3, next_check_at: 1.hour.from_now, rejected_at: Time.now)
    end

    it "approve! schedules a check 2 months out and resets check_count" do
      review.approve!
      expect(review.check_count).to eq(0)
      expect(review.next_check_at).to be_within(1.minute).of(InkReview::CHECK_INTERVAL.from_now)
      expect(review.approved_at).not_to be_nil
      expect(review.rejected_at).to be_nil
    end

    it "auto_approve! schedules a check 2 months out and resets check_count" do
      review.auto_approve!
      expect(review.check_count).to eq(0)
      expect(review.next_check_at).to be_within(1.minute).of(InkReview::CHECK_INTERVAL.from_now)
      expect(review.auto_approved).to eq(true)
    end

    it "agent_approve! schedules a check 2 months out and resets check_count" do
      review.agent_approve!
      expect(review.check_count).to eq(0)
      expect(review.next_check_at).to be_within(1.minute).of(InkReview::CHECK_INTERVAL.from_now)
      expect(review.agent_approved).to eq(true)
    end

    it "reject! clears next_check_at and resets check_count" do
      approved = create(:ink_review, check_count: 2, next_check_at: 1.hour.from_now)
      approved.reject!
      expect(approved.check_count).to eq(0)
      expect(approved.next_check_at).to be_nil
      expect(approved.rejected_at).not_to be_nil
    end

    it "auto_reject! clears next_check_at and resets check_count" do
      approved = create(:ink_review, check_count: 2, next_check_at: 1.hour.from_now)
      approved.auto_reject!
      expect(approved.check_count).to eq(0)
      expect(approved.next_check_at).to be_nil
      expect(approved.auto_approved).to eq(true)
    end

    it "agent_reject! clears next_check_at and resets check_count" do
      approved = create(:ink_review, check_count: 2, next_check_at: 1.hour.from_now)
      approved.agent_reject!
      expect(approved.check_count).to eq(0)
      expect(approved.next_check_at).to be_nil
      expect(approved.agent_approved).to eq(true)
    end
  end

  describe "scopes" do
    let!(:ok_due) do
      create(:ink_review, approved_at: Time.now, check_count: 0, next_check_at: 1.hour.ago)
    end
    let!(:ok_not_due) do
      create(:ink_review, approved_at: Time.now, check_count: 0, next_check_at: 1.day.from_now)
    end
    let!(:broken_due) do
      create(:ink_review, approved_at: Time.now, check_count: 2, next_check_at: 1.hour.ago)
    end
    let!(:removed) do
      create(:ink_review, approved_at: Time.now, check_count: 5, next_check_at: nil)
    end
    let!(:rejected) { create(:ink_review, rejected_at: Time.now, check_count: 0) }
    let!(:queued) { create(:ink_review) }

    it "live includes only approved reviews with check_count = 0" do
      expect(InkReview.live).to contain_exactly(ok_due, ok_not_due)
    end

    it "link_broken matches reviews with 0 < check_count < 5" do
      expect(InkReview.link_broken).to contain_exactly(broken_due)
    end

    it "link_removed matches reviews with check_count >= 5" do
      expect(InkReview.link_removed).to contain_exactly(removed)
    end

    it "due_for_check matches approved reviews whose next_check_at has passed" do
      expect(InkReview.due_for_check).to contain_exactly(ok_due, broken_due)
    end

    it "due_for_check excludes manually rejected reviews even if next_check_at is somehow set" do
      rejected.update_columns(next_check_at: 1.hour.ago)
      expect(InkReview.due_for_check).not_to include(rejected)
    end

    it "due_for_check excludes fully removed reviews (next_check_at IS NULL)" do
      expect(InkReview.due_for_check).not_to include(removed)
    end
  end
end
