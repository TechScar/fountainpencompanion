require "rails_helper"

describe ClassifyUser do
  let(:user) { create(:user) }

  it "runs the spam classifier for the user" do
    agent = instance_double(SpamClassifier)
    allow(SpamClassifier).to receive(:new).with(user).and_return(agent)
    allow(agent).to receive(:perform)

    described_class.new.perform(user.id)

    expect(agent).to have_received(:perform)
  end

  it "does nothing if the user does not exist" do
    expect { described_class.new.perform(-1) }.not_to raise_error
  end
end
