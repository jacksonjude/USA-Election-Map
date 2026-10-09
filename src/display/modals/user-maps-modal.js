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
		trDiv += `<span style='display: flex; flex: 1; min-width: 0;'>`
		trDiv += `<a data-untitled='${!name}' id='${userMap.id}-name-link' onclick='$(this).data("untitled") ? toggleUserMapNameEditing("${userMap.id}") : openUserMap("${userMap.id}")' class='name-label ${!name ? 'untitled-text' : ''}' style='text-decoration: underline; flex: 1;'>${name ?? 'Untitled'}</a>`
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
		trDiv += `<td class='date-cell'>${dateString}</td>`
		
		const country = mapCountries[userMap.country]
		const countryName = country?.getName()
		const countryIconURL = country?.getIconURL()
		trDiv += `<td class='country-cell'><span class='country-container'><img src='${countryIconURL}' style='width: 36px; height: 36px;'/><span class='country-name'>${countryName ?? 'Unknown'}</span></span></td>`
		
		const mapType = mapTypes[userMap.mapType]
		const mapTypeName = mapType?.getName()
		const mapTypeIcon = mapType?.getIconURL()
		trDiv += `<td class='type-cell'><span class='type-container'><img src='${mapTypeIcon}' class='type-image' style='width: 36px; height: 36px;'/><span class='type-name'>${mapTypeName ?? 'Unknown'}</span></span></td>`
		
		trDiv += `<td><a onclick='shareUserMap("${userMap.id}", this)' style='display: flex; justify-content: center;'>🔗</a></td>`
		trDiv += `<td><a id='${userMap.id}-delete' onclick='deleteUserMapClick("${userMap.id}", this)' style='display: flex; justify-content: center;'>🗑️</a></td>`
		
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