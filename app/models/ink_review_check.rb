class InkReviewCheck < ApplicationRecord
  RESULTS = %w[success error removed].freeze

  belongs_to :ink_review

  validates :result, inclusion: { in: RESULTS }
end
