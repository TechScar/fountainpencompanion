# Controller for managing usage records — daily log entries that track when a currently inked pen is used.
# Usage records are created from the currently inked list and browsed/deleted here.
class UsageRecordsController < ApplicationController
  before_action :authenticate_user!
  before_action :find_currently_inked, only: [:create]

  add_breadcrumb "Currently Inked", :currently_inked_index_path
  add_breadcrumb "Usage Records", :usage_records_path

  # Lists all usage records for the current user, ordered by date descending.
  # Supports HTML (paginated) and CSV export.
  def index
    @usage_records =
      current_user
        .usage_records
        .includes(currently_inked: %i[collected_ink collected_pen])
        .order(used_on: :desc, currently_inked_id: :asc)
    respond_to do |format|
      format.html { @usage_records = @usage_records.page(params[:page]) }
      format.csv do
        send_data @usage_records.to_csv, type: "text/csv", filename: "usage_records.csv"
      end
    end
  end

  # Creates a usage record for the given currently inked entry on the specified date (defaults to today).
  # Responds to HTML, JSON (returns updated currently inked serialization), and any other format.
  def create
    if @currently_inked
      used_on = params[:used_on].present? ? Date.parse(params[:used_on]) : Date.current
      @usage_record = @currently_inked.usage_records.find_or_initialize_by(used_on: used_on)
      if @usage_record.save
        respond_to do |format|
          format.html { redirect_to usage_records_path, notice: "Usage record created." }
          format.json do
            @currently_inked.reload
            render json:
                     CurrentlyInkedSerializer
                       .new(
                         @currently_inked,
                         include: %i[collected_ink collected_pen collected_ink.micro_cluster],
                         fields: {
                           micro_cluster: %i[macro_cluster]
                         }
                       )
                       .serializable_hash
                       .to_json,
                   status: :created
          end
          format.any { head :created }
        end
      else
        respond_to do |format|
          format.html do
            redirect_to usage_records_path, alert: @usage_record.errors.full_messages.join(", ")
          end
          format.any { head :unprocessable_entity }
        end
      end
    else
      respond_to do |format|
        format.html { redirect_to usage_records_path, alert: "Currently inked entry not found." }
        format.any { head :not_found }
      end
    end
  end

  # Deletes a usage record belonging to the current user.
  def destroy
    @usage_record = current_user.usage_records.find(params[:id])
    @usage_record.destroy
    redirect_to usage_records_path
  rescue ActiveRecord::RecordNotFound
    head :not_found
  end

  private

  # Loads the currently inked entry for the current user by ID from params
  def find_currently_inked
    @currently_inked = current_user.currently_inkeds.find_by(id: params[:currently_inked_id])
  end
end
