# Manages the user's archived collected pens.
# Renders the shared collected pens views in archive mode, allowing users to view, edit, unarchive, or delete archived pens.
class CollectedPensArchiveController < ApplicationController
  before_action :authenticate_user!
  before_action :find_collected_pen, only: %i[edit update destroy unarchive]

  add_breadcrumb "My pens", :collected_pens_path
  add_breadcrumb "Archive", :collected_pens_archive_index_path

  helper_method :archive?

  # Render the shared collected pens index view in archive mode
  def index
    render "collected_pens/index"
  end

  # Render form to edit an archived pen
  def edit
    add_breadcrumb "Edit '#{@collected_pen.name}'",
                   "#{collected_pens_archive_path(@collected_pen)}/edit"
    render "collected_pens/edit"
  end

  # Update an archived pen
  def update
    if SaveCollectedPen.new(@collected_pen, collected_pen_params).perform
      flash[:notice] = "Successfully updated '#{@collected_pen.name}'"
      redirect_to collected_pens_archive_index_path
    else
      render "collected_pens/edit"
    end
  end

  # Unarchive an archived pen
  def unarchive
    flash[:notice] = "Successfully unarchived '#{@collected_pen.name}'" if @collected_pen
    @collected_pen&.unarchive!
    redirect_to collected_pens_archive_index_path
  end

  # Delete an archived pen
  def destroy
    flash[:notice] = "Successfully deleted '#{@collected_pen.name}'" if @collected_pen
    @collected_pen&.destroy
    redirect_to collected_pens_archive_index_path
  end

  private

  # Find a pen for the current user by ID
  def find_collected_pen
    @collected_pen = current_user.collected_pens.find_by!(id: params[:id])
  end

  # Shared helper used by views to distinguish active/archive mode
  # Returns true for archive controller (false for active controller)
  def archive?
    true
  end

  # Whitelist permitted parameters for archived pen update
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
end
