# Manages the user's active currently inked records (pen/ink pairings).
# Renders the shared currently inked views for active records, allowing users to view, create, edit, mark as refilled, or archive currently inked entries.
#
# Each record links a collected pen and a collected ink, with an inked_on date and optional comment.
# Only the current user's records are accessible.
class CurrentlyInkedController < ApplicationController
  before_action :authenticate_user!
  before_action :find_currently_inked, only: %i[edit update archive refill]
  before_action :set_empty_record, only: %i[new]

  add_breadcrumb "Currently Inked", :currently_inked_index_path

  helper_method :archive?

  # List all currently inked records for the user
  # Supports HTML and CSV export
  def index
    cis = current_user.currently_inkeds.includes(:collected_pen, :collected_ink)
    respond_to do |format|
      format.html
      format.csv { send_data cis.to_csv, type: "text/csv", filename: "currently_inked.csv" }
    end
  end

  # Render form to add a new currently inked record
  def new
    add_breadcrumb "Add currently inked", "#{currently_inked_index_path}/new"
  end

  # Create a new currently inked record
  def create
    @record = current_user.currently_inkeds.build(currently_inked_params)
    if @record.save
      flash[:notice] = "Successfully created entry"
      redirect_to currently_inked_index_path
    else
      render :new
    end
  end

  # Render form to edit a currently inked record
  def edit
    add_breadcrumb "Edit '#{@record.name}'", "#{currently_inked_path(@record)}/edit"
  end

  # Update a currently inked record
  def update
    if @record.update(currently_inked_params)
      flash[:notice] = "Successfully updated '#{@record.name}'"
      redirect_to currently_inked_index_path
    else
      render :edit
    end
  end

  # Mark a currently inked record as refilled
  def refill
    @record.refill!
    flash[:notice] = "Refilled your #{@record.pen_name} with #{@record.ink_name}."
    redirect_to currently_inked_index_path
  end

  # Archive a currently inked record (soft-delete)
  def archive
    flash[:notice] = "Successfully archived '#{@record.name}'" if @record
    @record.archive!
    redirect_to currently_inked_index_path
  end

  private

  # Prepare a blank currently inked record
  def set_empty_record
    @record = CurrentlyInked.new(inked_on: Date.current, user: current_user)
  end

  # Find a currently inked record for the current user by ID
  def find_currently_inked
    @record = current_user.currently_inkeds.find(params[:id])
  end

  # Shared helper used by views to distinguish active/archive mode
  # Returns false for active controller (true for archive controller)
  def archive?
    false
  end

  # Whitelist permitted parameters for currently inked create/update
  def currently_inked_params
    params.require(:currently_inked).permit(
      :collected_ink_id,
      :collected_pen_id,
      :inked_on,
      :comment
    )
  end
end
