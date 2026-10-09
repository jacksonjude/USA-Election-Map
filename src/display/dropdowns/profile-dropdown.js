let editingDisplayName = false

const defaultUserColor = "#3478F6" // #290463
const hexColorRegex = /^#[0-9a-fA-F]{6}$/
let currentUserColor = defaultUserColor
let userColorUpdateTimeout

function handleSignIn(user)
{
	$('#profileDisplayNameContainer').show()
	$('#profileOpenMapsContainer').show()
	$('#profileSignOutContainer').show()
	$('#profileColorContainer').show()
	$('.profileSignInContainer').hide()
	
	$('#profileIconOutline').hide()
	$('#profileDisplayNameText').html(user.displayName ?? user.email)
	setProfileInitials(user.displayName ?? user.email)
	
	setUserColor(user.photoURL)
}

function handleSignOut()
{
	$('.profileSignInContainer').show()
	$('#profileDisplayNameContainer').hide()
	$('#profileOpenMapsContainer').hide()
	$('#profileSignOutContainer').hide()
	
	$('#profileIconOutline').show()
	$('#profileInitials').html('')
	
	$('#profileIconContainer').css('background-color', 'transparent')
	$('#profileIconContainer').css('outline-color', 'white')
}

function setProfileInitials(displayName)
{
	let profileNameWords = displayName.split(' ')
	if (profileNameWords.length >= 2)
	{
		profileNameWords = [profileNameWords.at(0), profileNameWords.at(-1)]
	}
	else if (profileNameWords.length == 1)
	{
		profileNameWords = [profileNameWords.at(0), profileNameWords.at(0).slice(1)]
	}
	const initials = profileNameWords.map(w => w.split('')[0].toUpperCase()).join('')
	
	$('#profileInitials').html(initials)
}

async function toggleUserDisplayNameEditing()
{
	const inputName = $('#profileDisplayNameInput').val()
	if (editingDisplayName && !inputName)
	{
		return
	}
	
	editingDisplayName = !editingDisplayName
	
	if (editingDisplayName)
	{
		$('#profileDisplayNameInput').show()
		$("#profileDisplayNameText").hide()
		
		$('#profileDisplayNameInput').focus().select()
		$('#profileDisplayNameInput').val(currentUser.displayName)
	}
	else
	{
		if (inputName != currentUser.displayName)
		{
			const updatedName = await updateDisplayName(inputName)
			
			setProfileInitials(updatedName)
			$('#profileDisplayNameText').html(updatedName)
		}
		
		$('#profileDisplayNameInput').val('')
		
		$('#profileDisplayNameText').show()
		$('#profileDisplayNameInput').hide()
	}
}

function setUserColor(userColor)
{
	currentUserColor = hexColorRegex.test(userColor) ? userColor : defaultUserColor
	
	$('#profileIconContainer').css('background-color', `${currentUserColor}66`)
	$('#profileIconContainer').css('outline-color', currentUserColor)
	
	$('#user-color-picker')[0].jscolor.fromString(currentUserColor)
	
	if (userColorUpdateTimeout)
	{
		clearTimeout(userColorUpdateTimeout)
	}
}

async function uploadUserColor(pickedColor)
{
	if (!hexColorRegex.test(pickedColor)) { return }
	
	setUserColor(pickedColor)
	
	userColorUpdateTimeout = setTimeout(() => updatePhotoUrl(pickedColor), 2000)
}