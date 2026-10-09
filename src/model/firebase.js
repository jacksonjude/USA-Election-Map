const firebaseConfig = {
	apiKey: "AIzaSyCiuWfULmz-h3G9nPuEAMUZhzwB2GkLYls",
	authDomain: "jj-election-map.firebaseapp.com",
	projectId: "jj-election-map",
	storageBucket: "jj-election-map.firebasestorage.app",
	messagingSenderId: "457495858439",
	appId: "1:457495858439:web:4f29bad70f1ab4ca1c89a2"
}

const recaptchaEnterpriseSiteKey = "6LcELN8tAAAAAA7xfxslj2XJrLfi2_agD5rTLoxK"

firebase.initializeApp(firebaseConfig)

if (location.hostname === 'localhost')
{
	self.FIREBASE_APPCHECK_DEBUG_TOKEN = true
}

const appCheck = firebase.appCheck()
appCheck.activate(new firebase.appCheck.ReCaptchaEnterpriseProvider(recaptchaEnterpriseSiteKey), true)

const auth = firebase.auth()
const db = firebase.firestore()
db.settings({ experimentalForceLongPolling: true })

let currentUser = null

auth.onAuthStateChanged((user) => {
	if (user && user.isAnonymous)
	{
		currentUser = user
		handleSignOut()
	}
	else if (user)
	{
		console.log("[Firebase] User login", user.uid, user.displayName, user)
		currentUser = user
		handleSignIn(currentUser)
	}
	else
	{
		currentUser = null
		handleSignOut()
	}
})

async function signInWithApple()
{
	const provider = new firebase.auth.OAuthProvider('apple.com')
	provider.addScope('email')
	provider.addScope('name')
	
	await signInWithProvider(provider)
}

async function signInWithGoogle()
{
	const provider = new firebase.auth.GoogleAuthProvider()
	
	await signInWithProvider(provider)
}

async function signInWithProvider(provider)
{
	try
	{
		addLoader(LoaderType.standard)
		
		const result = await auth.signInWithPopup(provider)
		currentUser = result.user
		return currentUser
	}
	catch (e)
	{
		console.log(e)
		return null
	}
	finally
	{
		removeLoader(LoaderType.standard)
	}
}

async function signInAnonymously()
{
	try
	{
		addLoader(LoaderType.standard)
		
		const result = await auth.signInAnonymously()
		currentUser = result.user
		return currentUser
	}
	catch (e)
	{
		console.log(e)
		return null
	}
	finally
	{
		removeLoader(LoaderType.standard)
	}
}

async function signOut()
{
	try
	{
		addLoader(LoaderType.standard)
		
		await auth.signOut()
		return true
	}
	catch (e)
	{
		console.log(e)
		return false
	}
	finally
	{
		removeLoader(LoaderType.standard)
	}
}

async function updateDisplayName(displayName)
{
	if (!currentUser) { return null }
	
	try
	{
		addLoader(LoaderType.standard)
		
		await currentUser.updateProfile({
			displayName: displayName
		})
		return displayName
	}
	catch (e)
	{
		console.log(e)
		return currentUser.displayName
	}
	finally
	{
		removeLoader(LoaderType.standard)
	}
}

async function updatePhotoUrl(photoURL)
{
	if (!currentUser) { return null }
	
	try
	{
		addLoader(LoaderType.standard)
		
		await currentUser.updateProfile({
			photoURL: photoURL
		})
		return photoURL
	}
	catch (e)
	{
		console.log(e)
		return currentUser.photoURL
	}
	finally
	{
		removeLoader(LoaderType.standard)
	}
}

async function getUserMapList()
{
	if (!currentUser) { return [] }
	
	try
	{
		addLoader(LoaderType.standard)
		
		const snap = await db.collection("maps")
			.where("ownerId", "==", currentUser.uid)
			.orderBy("updatedAt", "desc")
			.get()
		const maps = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
		return maps
	}
	catch (e)
	{
		console.log(e)
		return []
	}
	finally
	{
		removeLoader(LoaderType.standard)
	}
}

async function getUserMap(id)
{
	try
	{
		addLoader(LoaderType.standard)
		console.log("[Firestore] Fetching map", id)
		
		const mapMetaSnap = await db.doc(`maps/${id}`).get()
		const mapMetaDoc = mapMetaSnap.data()
		
		const mapContentSnap = await db.doc(`maps/${id}/content/data`).get()
		const mapContentDoc = mapContentSnap.data()
		const mapDataString = await decompressFromBase64(mapContentDoc.compressedData)
		
		return {
			countryID: mapMetaDoc.country,
			mapTypeID: mapMetaDoc.mapType,
			ownerID: mapMetaDoc.ownerId,
			mapDataString: mapDataString
		}
	}
	catch (e)
	{
		console.log(e)
		return null
	}
	finally
	{
		removeLoader(LoaderType.standard)
	}
}

async function saveCurrentUserMap()
{
	if (!currentUser) { return null }
	
	const id = currentCustomMapSource.getMapUUID()
	const countryID = currentMapCountry.getID()
	const mapTypeID = currentMapType.getID()
	const mapDataString = getMapFileDataString(currentCustomMapSource.getTextMapData(), kJSONFileType, currentCustomMapSource.getDropdownPartyIDs())
	
	if (!id || !countryID || !mapTypeID || !mapDataString) { return null }
	
	try
	{
		addLoader(LoaderType.standard)
		
		const compressedData = await compressToBase64(mapDataString)
		
		let mapSnap
		try
		{
			mapSnap = await db.doc(`maps/${id}`).get()
		}
		catch {}
		
		const currentDate = new Date()
		
		const meta = {
			updatedAt: currentDate,
			country: countryID,
			mapType: mapTypeID
		}
		if (!mapSnap || !mapSnap.exists)
		{
			meta.ownerId = currentUser.uid
			meta.name = null
			meta.createdAt = currentDate
		}
		
		console.log("[Firestore] Saving map", id, meta)
		
		await db.doc(`maps/${id}`).set(meta, { merge: true })
		
		await db.doc(`maps/${id}/content/data`).set({
			compressedData: compressedData
		})
		
		return id
	}
	catch (e)
	{
		console.log(e)
		return null
	}
	finally
	{
		removeLoader(LoaderType.standard)
	}
}

async function autoSaveCurrentUserMap()
{
	if (!currentUser || currentUser.isAnonymous) { return null }
	
	return await saveCurrentUserMap()
}

async function updateUserMapName(id, updatedName)
{
	if (!currentUser) { return false }
	
	try
	{
		addLoader(LoaderType.standard)
		console.log("[Firestore] Updating map name", id, updatedName)
		
		await db.doc(`maps/${id}`).set({
			name: updatedName
		}, { merge: true })
		
		return true
	}
	catch (e)
	{
		console.log(e)
		return false
	}
	finally
	{
		removeLoader(LoaderType.standard)
	}
}

async function deleteUserMap(id)
{
	if (!currentUser) { return false }
	
	try
	{
		addLoader(LoaderType.standard)
		console.log("[Firestore] Deleting map", id)
		
		const batch = db.batch()
		batch.delete(db.doc(`maps/${id}/content/data`))
		batch.delete(db.doc(`maps/${id}`))
		await batch.commit()
		
		return true
	}
	catch (e)
	{
		console.log(e)
		return false
	}
	finally
	{
		removeLoader(LoaderType.standard)
	}
}

async function compressToBase64(dataString) {
	const zip = new JSZip()
	zip.file("data", dataString)
	return await zip.generateAsync({
		type: "base64",
		compression: "DEFLATE",
		compressionOptions: { level: 9 }
	})
}

async function decompressFromBase64(base64) {
	const zip = await JSZip.loadAsync(base64, { base64: true })
	const text = await zip.file("data").async("string")
	return text
}