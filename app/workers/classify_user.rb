class ClassifyUser
  include Sidekiq::Worker

  def perform(user_id)
    user = User.find_by(id: user_id)
    return unless user

    SpamClassifier.new(user).perform
  end
end
