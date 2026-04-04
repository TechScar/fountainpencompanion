# Manages the user's active (non-archived) collected pens.
# Renders the shared collected pens views for active pens, allowing users to view, create, edit, or archive pens.
class CollectedPensController < ApplicationController
  before_action :authenticate_user!
  before_action :set_flash, except: [:import]
  before_action :find_collected_pen, only: %i[edit update archive]

  add_breadcrumb "My pens", :collected_pens_path

  helper_method :archive?

  # List all active pens for the current user
  # Supports CSV export format
  def index
    pens =
      current_user
        .collected_pens
        .includes(:currently_inkeds, :usage_records, newest_currently_inked: :last_usage)
        .order(:brand, :model, :nib, :color, :comment)
    respond_to do |format|
      format.html
      format.csv { send_data pens.to_csv, type: "text/csv", filename: "collected_pens.csv" }
    end
  end

  # Render form to add a new pen
  def new
    add_breadcrumb "Add pen", "#{collected_pens_path}/new"

    @collected_pen = current_user.collected_pens.build
  end

  # Render import form for bulk pen uploads
  def import
  end

  # Add a new pen for the current user
  def create
    @collected_pen = current_user.collected_pens.build(collected_pen_params)
    if SaveCollectedPen.new(@collected_pen, collected_pen_params).perform
      flash[:notice] = "Successfully added '#{@collected_pen.name}'"
      redirect_to collected_pens_path
    else
      render :new
    end
  end

  # Render form to edit an active pen
  def edit
    add_breadcrumb "Edit '#{@collected_pen.name}'", "#{collected_pen_path(@collected_pen)}/edit"
  end

  # Update an active pen
  def update
    if SaveCollectedPen.new(@collected_pen, collected_pen_params).perform
      flash[:notice] = "Successfully updated '#{@collected_pen.name}'"
      redirect_to collected_pens_path
    else
      render :edit
    end
  end

  # Archive an active pen
  def archive
    flash[:notice] = "Successfully archived '#{@collected_pen.name}'" if @collected_pen
    @collected_pen&.archive!
    redirect_to collected_pens_path
  end

  private

  # Find a pen for the current user by ID
  def find_collected_pen
    @collected_pen = current_user.collected_pens.find_by(id: params[:id])
  end

  # Shared helper used by views to distinguish active/archive mode
  # Returns false for active controller (true for archive controller)
  def archive?
    false
  end

  # Whitelist permitted parameters for pen create/update
  def collected_pen_params
    params.require(:collected_pen).permit(
      :brand,
      :model,
      :nib,
      :color,
      :material,
      :price,
      :trim_color,
      :filling_system,
      :comment
    )
  end

  # Display privacy notice to user about pen collection visibility
  def set_flash
    flash.now[
      :primary
    ] = "Your pen collection is private and no one but you can see it. This is because pens can be worth quite a lot and I don't want to provide a list of people to rob. Maybe this will change in the future, but there will always be the possibility to keep this part private."
  end
end
