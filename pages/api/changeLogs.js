let changelogStorage = new Map();

function compareSkins(oldSkin, newSkin, skinName) {
  const changes = [];
  
  if (!oldSkin && newSkin) {
    changes.push({
      field: 'status',
      oldValue: null,
      newValue: 'added',
      description: `Added new skin: ${skinName}`
    });
    return changes;
  }
  
  if (oldSkin && !newSkin) {
    changes.push({
      field: 'status',
      oldValue: 'existing',
      newValue: null,
      description: `Removed skin: ${skinName}`
    });
    return changes;
  }
  
  const fields = ['Base Value', 'Skin Rarity', 'Obtainable By', 'Type'];
  for (const field of fields) {
    const oldValue = oldSkin[field];
    const newValue = newSkin[field];
    
    if (oldValue !== newValue) {
      changes.push({
        field: field,
        oldValue: oldValue,
        newValue: newValue,
        description: `${field}: "${oldValue}" → "${newValue}"`
      });
    }
  }
  
  return changes;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Content-Type', 'application/json');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    console.log('🔍 Checking for skin changes...');
    
    // Fetch live data
    const liveResponse = await fetch('https://opensheet.elk.sh/1pxMSoaSo8FYv-OIJ26HpSj8EDy7EDRmatHyQW24o6E4/Sorted+View');
    if (!liveResponse.ok) throw new Error(`Live data failed: ${liveResponse.status}`);
    const liveData = await liveResponse.json();
    
    // Fetch old data
    const oldResponse = await fetch('https://raw.githubusercontent.com/OBS-Akuma/KirkaSkins/refs/heads/main/BOLT/updatelog.json');
    if (!oldResponse.ok) throw new Error(`Old data failed: ${oldResponse.status}`);
    const oldData = await oldResponse.json();
    
    console.log(`Live: ${liveData.length}, Old: ${oldData.length}`);
    
    // Create maps
    const oldMap = new Map(oldData.map(s => [s['Skin Name'], s]));
    const liveMap = new Map(liveData.map(s => [s['Skin Name'], s]));
    const allNames = new Set([...oldMap.keys(), ...liveMap.keys()]);
    
    // Find changes
    const newChanges = [];
    for (const name of allNames) {
      const oldSkin = oldMap.get(name);
      const liveSkin = liveMap.get(name);
      const changes = compareSkins(oldSkin, liveSkin, name);
      
      if (changes.length > 0) {
        newChanges.push({ 
          skinName: name, 
          changes, 
          oldData: oldSkin || null,
          newData: liveSkin || null
        });
      }
    }
    
    console.log(`${newChanges.length} change(s)`);
    
    // Process each change and save to memory storage
    const savedChanges = [];
    
    for (const change of newChanges) {
      // Check if already in memory storage
      const existingChange = changelogStorage.get(change.skinName);
      
      let changeData = {
        changeId: change.skinName,
        skinName: change.skinName,
        changes: change.changes,
        oldData: change.oldData,
        newData: change.newData,
        detectedAt: new Date().toISOString()
      };
      
      if (!existingChange) {
        // Save to memory storage
        changelogStorage.set(change.skinName, changeData);
        console.log(`${change.skinName}`);
        savedChanges.push(changeData);
      } else {
        // Check if changes are different from previously saved
        if (JSON.stringify(existingChange.changes) !== JSON.stringify(change.changes)) {
          // Update with new changes
          changelogStorage.set(change.skinName, changeData);
          savedChanges.push({
            ...changeData,
            previousDetectedAt: existingChange.detectedAt
          });
          console.log(`${change.skinName}`);
        } else {
          console.log(`${change.skinName}`);
        }
      }
    }
    
    // Fetch all changelogs from memory storage
    const allChangelogs = Array.from(changelogStorage.values())
      .sort((a, b) => new Date(b.detectedAt) - new Date(a.detectedAt))
      .slice(0, 50);
    
    // Return response with detailed change data
    return res.status(200).json({
      success: true,
      hasUpdates: newChanges.length > 0,
      timestamp: new Date().toISOString(),
      summary: {
        oldTotal: oldData.length,
        newTotal: liveData.length,
        totalChanges: newChanges.length,
        addedSkins: newChanges.filter(c => !c.oldData && c.newData).length,
        removedSkins: newChanges.filter(c => c.oldData && !c.newData).length,
        modifiedSkins: newChanges.filter(c => c.oldData && c.newData).length
      },
      // Detailed change data for display
      currentChanges: savedChanges.map(change => ({
        skinName: change.skinName,
        changeId: change.changeId,
        detectedAt: change.detectedAt,
        changes: change.changes.map(c => ({
          field: c.field,
          oldValue: c.oldValue,
          newValue: c.newValue,
          description: c.description
        })),
        oldData: change.oldData,
        newData: change.newData,
        ...(change.previousDetectedAt && {
          previousDetectedAt: change.previousDetectedAt
        })
      })),
      // All recent changelogs from memory
      recentChangelogs: allChangelogs
    });
    
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
