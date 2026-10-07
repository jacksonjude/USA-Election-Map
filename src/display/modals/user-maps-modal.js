let userMapsModalOpen = false
let editUserMapNameID = null
let pendingDeleteUserMapID = null

async function openUserMapsModal()
{
	userMapsModalOpen = true
	
	$('#modalsContainer').trigger('show')
	$('.dropdown-content').css('display', 'none')
	
	$('#modalBackdrop').attr('onclick', 'closeUserMapsModal()')
	
	$('#userMapsModalContainer').show()
	
	$('#userMapsTable tr').not(":first").remove()
	
	if (currentEditingState == EditingState.editing)
	{
		await toggleEditing(EditingState.viewing)
	}
	
	const userMaps = await getUserMapList()
	for (const userMap of userMaps)
	{
		let trDiv = `<tr id='${userMap.id}-row' style='background-color: ${userMap.id == currentMapSource.getMapUUID() ? `${currentUserColor}44` : 'clear'};'>`
		
		const name = userMap.name
		trDiv += '<td>'
		trDiv += `<span style='display: flex; justify-content: space-between; align-items: center;'>`
		trDiv += `<span style='display: flex; flex: 1;'>`
		trDiv += `<a data-untitled='${!name}' id='${userMap.id}-name-link' onclick='$(this).data("untitled") ? toggleUserMapNameEditing("${userMap.id}") : openUserMap("${userMap.id}")' class='${!name ? 'untitled-text' : ''}' style='text-decoration: underline; flex: 1;'>${name ?? 'Untitled'}</a>`
		trDiv += `<input id='${userMap.id}-name-text' class='textInput' type='text' style='display: none;' />`
		trDiv += '</span>'
		trDiv += `<a id='${userMap.id}-rename' onclick='toggleUserMapNameEditing("${userMap.id}")'>✏️</a>`
		trDiv += '</span>'
		trDiv += '</td>'
		
		const updatedDate = userMap.updatedAt.toDate()
		const formattedUpdatedDate = updatedDate.toLocaleTimeString(undefined, {
			year: 'numeric',
			month: 'numeric',
			day: 'numeric',
			hour: 'numeric',
			minute: 'numeric'
		})
		const dateString = `${formattedUpdatedDate}`
		trDiv += `<td>${dateString}</td>`
		
		const country = mapCountries[userMap.country]
		const countryName = country?.getName()
		const countryIconURL = country?.getIconURL()
		trDiv += `<td style='display: flex; align-items: center;'><img src='${countryIconURL}' style='width: 36rem; height: 36rem; padding-right: 12rem;'/>${countryName ?? 'Unknown'}</td>`
		
		const electionTypeName = mapTypes[userMap.mapType]?.getName()
		trDiv += `<td>${electionTypeName ?? 'Unknown'}</td>`
		
		trDiv += `<td><span style='display: flex; justify-content: space-evenly; gap: 16rem;'>`
		trDiv += `<a onclick='shareUserMap("${userMap.id}", this)'>🔗</a>`
		trDiv += `<a id='${userMap.id}-delete' onclick='deleteUserMapClick("${userMap.id}", this)'>🗑️</a>`
		trDiv += '</span></td>'
		
		trDiv += '</tr>'
		$('#userMapsTable').append(trDiv)
	}
}

function closeUserMapsModal()
{
	userMapsModalOpen = false
	editUserMapNameID = null
	pendingDeleteUserMapID = null
	
	$('#modalsContainer').trigger('hide')
	$('#userMapsModalContainer').hide()
}

async function openUserMap(id)
{
	closeUserMapsModal()
	
	const userMapContent = await getUserMap(id)
	if (!userMapContent) { return }
	
	const shouldSetCountry = userMapContent.countryID != currentMapCountry.getID()
	if (shouldSetCountry)
	{
		await setMapCountry(userMapContent.countryID, null, false)
	}
	
	const shouldSetMapType = userMapContent.mapTypeID != currentMapType.getID() || shouldSetCountry
	if (shouldSetMapType)
	{
		await setMapType(userMapContent.mapTypeID, null, false)
	}
	
	const success = jsonFileLoaded({ target: { result: userMapContent.mapDataString } })
	if (success && userMapContent.ownerID == currentUser.uid)
	{
		currentCustomMapSource.setMapUUID(id)
	}
}

async function toggleUserMapNameEditing(id)
{
	if (editUserMapNameID)
	{
		const updatedName = $(`#${editUserMapNameID}-name-text`).val()
		if (updatedName.length > 0)
		{
			const success = await updateUserMapName(editUserMapNameID, updatedName)
			if (!success)
			{
				return
			}
			
			$(`#${editUserMapNameID}-name-link`).html(updatedName)
			$(`#${editUserMapNameID}-name-link`).removeClass('untitled-text')
			$(`#${editUserMapNameID}-name-link`).data('untitled', false)
		}
		
		$(`#${editUserMapNameID}-name-link`).show()
		$(`#${editUserMapNameID}-name-text`).hide()
		$(`#${editUserMapNameID}-rename`).html('✏️')
	}
	
	if (!id || editUserMapNameID == id)
	{
		editUserMapNameID = null
		return
	}
	
	editUserMapNameID = id
	
	$(`#${id}-name-text`).show()
	$(`#${id}-name-link`).hide()
	$(`#${id}-rename`).html('✅')
	
	const isUntitled = $(`#${id}-name-link`).data('untitled')
	const currentName = !isUntitled ? $(`#${id}-name-link`).html() : ''
	$(`#${id}-name-text`).val(currentName)
	$(`#${id}-name-text`).focus().select()
}

async function shareUserMap(id, buttonDiv)
{
	try
	{
		await copyMapShareLink(id)
	}
	catch (e)
	{
		console.log(e)
		return
	}
	
	$(buttonDiv).html('☑️')
	const resetTimeout = setTimeout(() => {
		$(buttonDiv).html('🔗')
	}, 3000)
	
	clearTimeout($(buttonDiv).data('resetTimeout'))
	$(buttonDiv).data('resetTimeout', resetTimeout)
}

async function deleteUserMapClick(id, buttonDiv)
{
	if (pendingDeleteUserMapID != id)
	{
		if (pendingDeleteUserMapID)
		{
			$(`#${pendingDeleteUserMapID}-delete`).html('🗑️')
		}
		
		pendingDeleteUserMapID = id
		$(buttonDiv).html('⚠️')
		
		return
	}
	
	const result = await deleteUserMap(id)
	if (!result)
	{
		return
	}
	
	$(`#${id}-row`).remove()
	pendingDeleteUserMapID = null
}