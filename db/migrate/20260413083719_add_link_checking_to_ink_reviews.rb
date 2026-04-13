class AddLinkCheckingToInkReviews < ActiveRecord::Migration[8.1]
  disable_ddl_transaction!

  def change
    add_column :ink_reviews, :next_check_at, :datetime
    add_column :ink_reviews, :check_count, :integer, default: 0, null: false
    add_index :ink_reviews, :next_check_at, algorithm: :concurrently

    create_table :ink_review_checks do |t|
      t.references :ink_review, null: false, foreign_key: true
      t.string :result, null: false
      t.text :error_message
      t.timestamps
    end
    add_index :ink_review_checks, %i[result created_at]

    up_only do
      sql = <<~SQL
        UPDATE ink_reviews
        SET next_check_at = NOW() + (RANDOM() * INTERVAL '60 days')
        WHERE approved_at IS NOT NULL AND rejected_at IS NULL
      SQL
      safety_assured { execute(sql) }
    end
  end
end
