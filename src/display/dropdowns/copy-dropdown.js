const EditingMode = {
  margin: 0,
  voteshare: 1
}
var currentEditingMode = EditingMode.margin

function selectEditMode(newEditingMode)
{
  currentEditingMode = newEditingMode
  updateSelectedEditMode()
  toggleEditing()
}

function updateSelectedEditMode()
{
  switch (currentEditingMode)
  {
    case EditingMode.margin:
    $("#editMarginButton").addClass('active')
    $("#editVoteshareButton").removeClass('active')
    break

    case EditingMode.voteshare:
    $("#editVoteshareButton").addClass('active')
    $("#editMarginButton").removeClass('active')
    break
  }
}
