import { useState } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import TabLibrary from './components/TabLibrary';
import TabViewer from './components/TabViewer';
import TabEditor from './components/TabEditor';

const SAMPLE_TABS = [
  {
    id: 'sample-1',
    title: 'Wonderwall',
    artist: 'Oasis',
    content: `[Intro]
Em7  G  Dsus4  A7sus4

[Verse 1]
Em7              G
Today is gonna be the day
          Dsus4              A7sus4
That they're gonna throw it back to you
Em7              G
By now you should've somehow
       Dsus4          A7sus4
Realized what you gotta do
Em7    G       Dsus4    A7sus4
I don't believe that anybody
Em7         G    Dsus4  A7sus4
Feels the way I do about you now

[Chorus]
          C          Em7          G
Because maybe,   you're gonna be the one that saves me
          C          Em7               G
And after all,  you're my wonderwall`,
  },
  {
    id: 'sample-2',
    title: 'Wish You Were Here',
    artist: 'Pink Floyd',
    content: `[Intro - fingerpicking]
  e|---0---0-3-0---0-2-0---0---0-3-5-3-0---|
  B|---0---0---0---0---0---0---0-----------|
  G|-0---0-----------0---0---0-------------|
  D|----------------------------4----------|
  A|-2---------------------------------0---|
  E|----------------------------3---------|

[Verse]
G                               Em
So, so you think you can tell
        Am
Heaven from Hell, blue skies from pain
         C                           G
Can you tell a green field from a cold steel rail?
      Em                    Am
A smile from a veil? Do you think you can tell?

[Chorus]
C                          D
Did they get you to trade your heroes for ghosts?
        Am                       G
Hot ashes for trees? Hot air for a cool breeze?
C                      D
Cold comfort for change? And did you exchange
Am                          G
A walk on part in the war for a lead role in a cage?`,
  },
  {
    id: 'sample-3',
    title: 'Perfect',
    artist: 'Ed Sheeran',
    content: `[Verse 1]
G
I found a love for me
                    Em
Darling, just dive right in and follow my lead
                  C
Well, I found a girl beautiful and sweet
           D
Oh, I never knew you were the someone waiting for me

[Pre-Chorus]
G                         Em
'Cause we were just kids when we fell in love
                    C                  D
Not knowing what it was, I will not give you up this time

[Chorus]
     G                    Em
Baby, I'm dancing in the dark with you between my arms
          C                     D
Barefoot on the grass, listening to our favourite song
       G                    Em
When you said you looked a mess, I whispered underneath my breath
         C                 D              G
But you heard it, darling, you look perfect tonight`,
  },
];

// Views
const VIEW = { LIBRARY: 'library', VIEWER: 'viewer', EDITOR: 'editor' };

export default function App() {
  const [tabs, setTabs] = useLocalStorage('guitar-tab-vault-tabs', SAMPLE_TABS);
  const [view, setView] = useState(VIEW.LIBRARY);
  const [activeTab, setActiveTab] = useState(null);
  const [editingTab, setEditingTab] = useState(null);

  const openTab = (tab) => {
    setActiveTab(tab);
    setView(VIEW.VIEWER);
  };

  const openNew = () => {
    setEditingTab(null);
    setView(VIEW.EDITOR);
  };

  const openEdit = () => {
    setEditingTab(activeTab);
    setView(VIEW.EDITOR);
  };

  const saveTab = (tab) => {
    setTabs((prev) => {
      const idx = prev.findIndex((t) => t.id === tab.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = tab;
        return updated;
      }
      return [tab, ...prev];
    });
    setActiveTab(tab);
    setView(VIEW.VIEWER);
  };

  const deleteTab = (id) => {
    if (!window.confirm('Delete this tab?')) return;
    setTabs((prev) => prev.filter((t) => t.id !== id));
    setView(VIEW.LIBRARY);
    setActiveTab(null);
  };

  if (view === VIEW.VIEWER && activeTab) {
    return (
      <TabViewer
        tab={activeTab}
        onBack={() => setView(VIEW.LIBRARY)}
        onEdit={openEdit}
      />
    );
  }

  if (view === VIEW.EDITOR) {
    return (
      <TabEditor
        tab={editingTab}
        onSave={saveTab}
        onBack={() => setView(activeTab ? VIEW.VIEWER : VIEW.LIBRARY)}
        onDelete={deleteTab}
      />
    );
  }

  return (
    <TabLibrary
      tabs={tabs}
      onSelectTab={openTab}
      onAddNew={openNew}
      onDelete={deleteTab}
    />
  );
}
