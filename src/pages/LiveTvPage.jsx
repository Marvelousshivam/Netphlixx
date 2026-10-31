import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Radio } from 'lucide-react';
import Navbar from '../components/Navbar';
import HlsPlayer from '../components/HlsPlayer';

export default function LiveTvPage() {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeChannel, setActiveChannel] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('All');
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    async function fetchChannels() {
      try {
        const res = await fetch('http://localhost:4000/api/livetv');
        if (!res.ok) throw new Error('Failed to fetch channels');
        const data = await res.json();
        setChannels(data);
        if (data.length > 0) setActiveChannel(data[0]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchChannels();
  }, []);

  const groups = ['All', ...new Set(channels.map((c) => c.group).filter(Boolean))].sort();

  const filteredChannels = channels.filter((c) => {
    const safeName = c.name || '';
    const safeGroup = c.group || '';
    const matchesSearch =
      safeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      safeGroup.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGroup = selectedGroup === 'All' || safeGroup === selectedGroup;
    return matchesSearch && matchesGroup;
  });

  useEffect(() => {
    if (filteredChannels.length > 0) {
      const isStillVisible = filteredChannels.some((c) => c.id === activeChannel?.id);
      if (!isStillVisible) {
        setActiveChannel(filteredChannels[0]);
      }
    } else if (activeChannel) {
      setActiveChannel(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, selectedGroup, channels, activeChannel]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f1014] text-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-[#0f1014] text-white font-sans flex flex-col h-screen overflow-hidden"
    >
      <Navbar
        activeTab="Live TV"
        onSearch={setSearchQuery}
        mobileSearchOpen={mobileSearchOpen}
        toggleMobileSearch={() => setMobileSearchOpen(!mobileSearchOpen)}
      />

      {/* Screen Container */}
      <div className="w-full flex-none bg-black pt-20 pb-4 h-[45vh] md:h-[55vh] relative border-b border-white/10 shadow-2xl z-10">
        {activeChannel ? (
          <div className="w-full h-full max-w-7xl mx-auto relative flex items-center justify-center group">
            <HlsPlayer
              src={activeChannel.url}
              className="w-full h-full object-contain bg-black"
              autoPlay
              controls
            />
            <div className="absolute top-4 left-4 glass-panel px-3.5 py-1.5 rounded-xl flex items-center space-x-3 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
              {activeChannel.logo ? (
                <img
                  src={activeChannel.logo}
                  className="h-6 w-auto object-contain max-w-[70px]"
                  alt="logo"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <Radio className="w-5 h-5 text-white" />
              )}
              <div>
                <p className="font-bold text-xs text-white leading-tight">{activeChannel.name}</p>
                <p className="text-[10px] text-[#E50914] font-bold uppercase tracking-wider flex items-center mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E50914] mr-1 animate-pulse" />{' '}
                  LIVE
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500 flex-col">
            <Radio className="w-10 h-10 mb-3 opacity-40" />
            <p className="text-xs">Select a live channel to stream</p>
          </div>
        )}
      </div>

      {/* Channel Guide */}
      <div className="flex-1 overflow-hidden flex flex-col bg-[#07080b]">
        <div className="p-3 border-b border-white/[0.06] flex items-center justify-start flex-none z-10 bg-[#07080b]">
          <div className="flex space-x-2 overflow-x-auto w-full scrollbar-hide">
            {groups.map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGroup(g)}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedGroup === g
                    ? 'bg-white text-black shadow-md'
                    : 'bg-white/[0.04] text-gray-300 hover:bg-white/10'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 pb-20 md:pb-0">
            {filteredChannels.map((channel) => (
              <div
                key={channel.id}
                onClick={() => setActiveChannel(channel)}
                className={`cursor-pointer rounded-xl overflow-hidden border transition-all duration-300 ${
                  activeChannel?.id === channel.id
                    ? 'border-[#E50914] ring-2 ring-[#E50914]/50 bg-[#E50914]/10 shadow-lg'
                    : 'border-white/[0.08] hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.06]'
                }`}
              >
                <div className="aspect-[4/3] flex items-center justify-center p-3 bg-black/40">
                  {channel.logo ? (
                    <img
                      src={channel.logo}
                      className="max-w-full max-h-full object-contain filter drop-shadow-md"
                      alt={channel.name || 'Channel'}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div
                    className="w-full h-full flex flex-col items-center justify-center text-gray-500"
                    style={{ display: channel.logo ? 'none' : 'flex' }}
                  >
                    <Radio className="w-6 h-6 mb-1 opacity-50" />
                    <span className="text-[10px] uppercase font-bold tracking-wider text-center px-1">
                      {(channel.name || 'Unknown').substring(0, 15)}
                    </span>
                  </div>
                </div>
                <div className="p-2.5 bg-black/60 border-t border-white/[0.04]">
                  <p className="text-white text-xs font-bold line-clamp-1">
                    {channel.name || 'Unknown'}
                  </p>
                  <p className="text-gray-500 text-[10px] uppercase tracking-wider mt-0.5 line-clamp-1">
                    {channel.group || 'General'}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {filteredChannels.length === 0 && (
            <div className="text-center text-gray-500 py-16 flex flex-col items-center">
              <Radio className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-xs">No channels found for this category.</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
