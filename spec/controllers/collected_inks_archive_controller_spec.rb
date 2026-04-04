require "rails_helper"

describe CollectedInksArchiveController do
  render_views

  let(:user) { create(:user) }
  let!(:ink) { create(:collected_ink, user: user, archived_on: Date.today) }

  describe "#index" do
    it "requires authentication" do
      get :index
      expect(response).to redirect_to(new_user_session_path)
    end

    context "signed in" do
      before { sign_in(user) }

      it "renders the archive React mount" do
        get :index
        expect(response).to be_successful
        expect(response.body).to include("data-archive=\"true\"")
      end
    end
  end

  describe "#update" do
    it "requires authentication" do
      put :update, params: { id: ink.id, collected_ink: { brand_name: "new brand" } }
      expect(response).to redirect_to(new_user_session_path)
    end

    context "signed in" do
      before { sign_in(user) }

      it "updates the ink" do
        expect do
          put :update, params: { id: ink.id, collected_ink: { brand_name: "new brand" } }
        end.to change { ink.reload.brand_name }.to("new brand")
        expect(response).to redirect_to(collected_inks_archive_index_path)
      end

      it "renders edit on validation error" do
        put :update, params: { id: ink.id, collected_ink: { brand_name: "" } }
        expect(response).to render_template("collected_inks/edit")
      end

      it "does not update inks from other users" do
        other_ink = create(:collected_ink, archived_on: Date.today)
        expect do
          put :update, params: { id: other_ink.id, collected_ink: { brand_name: "new brand" } }
        end.to raise_error(ActiveRecord::RecordNotFound)
      end
    end
  end

  describe "#unarchive" do
    it "requires authentication" do
      post :unarchive, params: { id: ink.id }
      expect(response).to redirect_to(new_user_session_path)
    end

    context "signed in" do
      before { sign_in(user) }

      it "unarchives the ink" do
        expect do post :unarchive, params: { id: ink.id } end.to change {
          ink.reload.archived_on
        }.from(Date.today).to(nil)
        expect(response).to redirect_to(collected_inks_archive_index_path)
      end

      it "does not unarchive inks from other users" do
        other_ink = create(:collected_ink, archived_on: Date.today)
        expect do post :unarchive, params: { id: other_ink.id } end.to raise_error(
          ActiveRecord::RecordNotFound
        )
      end
    end
  end

  describe "#destroy" do
    it "requires authentication" do
      delete :destroy, params: { id: ink.id }
      expect(response).to redirect_to(new_user_session_path)
    end

    context "signed in" do
      before { sign_in(user) }

      it "deletes the ink" do
        expect do delete :destroy, params: { id: ink.id } end.to change {
          user.collected_inks.count
        }.by(-1)
        expect(response).to redirect_to(collected_inks_archive_index_path)
      end

      it "does not delete inks from other users" do
        other_ink = create(:collected_ink, archived_on: Date.today)
        expect do delete :destroy, params: { id: other_ink.id } end.to raise_error(
          ActiveRecord::RecordNotFound
        )
      end
    end
  end
end
