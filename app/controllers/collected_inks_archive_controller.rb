# Manages the user's archived collected inks.
# Renders the shared collected inks views in archive mode, allowing users to view, edit, unarchive, or delete archived inks.
class CollectedInksArchiveController < ApplicationController
  before_action :authenticate_user!
  before_action :find_collected_ink, only: %i[edit update destroy unarchive]

  add_breadcrumb "My inks", :collected_inks_path
  add_breadcrumb "Archive", :collected_inks_archive_index_path

  helper_method :archive?

  # Render the shared collected inks index view in archive mode
  def index
    render "collected_inks/index"
  end

  # Render form to edit an archived ink
  def edit
    add_breadcrumb "Edit '#{@collected_ink.name}'",
                   "#{collected_inks_archive_path(@collected_ink)}/edit"
    render "collected_inks/edit"
  end

  # Update an archived ink
  def update
    if SaveCollectedInk.new(@collected_ink, collected_ink_params).perform
      flash[:notice] = "Successfully updated '#{@collected_ink.name}'"
      redirect_to collected_inks_archive_index_path
    else
      render "collected_inks/edit"
    end
  end

  # Unarchive an archived ink
  def unarchive
    flash[:notice] = "Successfully unarchived '#{@collected_ink.name}'" if @collected_ink
    @collected_ink&.unarchive!
    redirect_to collected_inks_archive_index_path
  end

  # Delete an archived ink
  def destroy
    flash[:notice] = "Successfully deleted '#{@collected_ink.name}'" if @collected_ink
    @collected_ink&.destroy
    redirect_to collected_inks_archive_index_path
  end

  private

  # Find an ink for the current user by ID
  def find_collected_ink
    @collected_ink = current_user.collected_inks.find(params[:id])
  end

  # Shared helper used by views to distinguish active/archive mode
  # Returns true for archive controller (false for active controller)
  def archive?
    true
  end

  # Whitelist permitted parameters for archived ink update
  def collected_ink_params
    params.require(:collected_ink).permit(
      :brand_name,
      :line_name,
      :ink_name,
      :maker,
      :kind,
      :swabbed,
      :used,
      :comment,
      :private_comment,
      :color,
      :private,
      :tags_as_string
    )
  end
end
