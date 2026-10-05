let currentEditingMode = EditingMode.margin

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

async function copyMapShareLink(id)
{
  const url = new URL(window.location.href)
  url.searchParams.set('id', id)
  
  await navigator.clipboard.writeText(url.toString())
}

async function shareCurrentUserMap(buttonDiv)
{
  if (!currentUser)
  {
    await signInAnonymously()
  }

  const id = await saveCurrentUserMap()
  if (!id) { return }
  
  try
  {
    await copyMapShareLink(id)
  }
  catch (e)
  {
    console.log(e)
    return
  }
  
  $(buttonDiv).html('<span style="margin-right: 8px;">✅</span>Copied')
  const resetTimeout = setTimeout(() => {
    $(buttonDiv).html('<span style="margin-right: 8px;">🔗</span>Share map')
  }, 3000)
  
  clearTimeout($(buttonDiv).data('resetTimeout'))
  $(buttonDiv).data('resetTimeout', resetTimeout)
}
