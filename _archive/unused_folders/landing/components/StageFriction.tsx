import React from 'react';
import { motion, MotionValue, useTransform } from 'framer-motion';
import { BrowserWindowFrame } from './DeviceFrames';
import { Image as ImageIcon } from 'lucide-react';

interface StageProps {
  scrollYProgress: MotionValue<number>;
}

export const StageFriction: React.FC<StageProps> = ({ scrollYProgress }) => {
  // Updated to start after extended hero stage completes (hero ends at 0.6)
  // We start fading in at 0.55 to ensure seamless overlap
  
  const opacity = useTransform(scrollYProgress, [0.55, 0.63, 0.78, 0.86], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0.55, 0.65], [0.95, 1]);
  const y = useTransform(scrollYProgress, [0.55, 0.65], [50, 0]);

  return (
    <motion.section 
      style={{ opacity, scale, y }}
      className="absolute inset-0 h-screen w-full flex items-center justify-center pointer-events-none"
    >
      {/* Increased height to 90vh for maximum screen usage */}
      <div className="container mx-auto px-4 max-w-[95rem] h-[90vh]">
        <div className="grid grid-cols-2 gap-4 lg:gap-8 items-start h-full" style={{ paddingTop: '2%' }}>
          
          {/* Left: Your Current Application (Browser) */}
          <div className="h-full">
             <BrowserWindowFrame label="What you send">
              <div className="w-full h-full bg-white text-black font-sans flex flex-col relative overflow-hidden">
                {/* Toolbar */}
                <div className="h-12 border-b border-gray-200 flex items-center px-4 gap-2 bg-white shrink-0">
                    <button className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded">Send</button>
                    <div className="w-px h-5 bg-gray-200"></div>
                    <button className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded">B</button>
                    <button className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded">I</button>
                    <button className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded">U</button>
                    <div className="w-px h-5 bg-gray-200 ml-2"></div>
                    <button className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded flex items-center gap-1">
                        <ImageIcon size={12} className="text-gray-500"/>
                        <span>Attach</span>
                    </button>
                    <div className="flex-1"></div>
                    <span className="text-[10px] text-gray-400">Draft saved</span>
                </div>
                {/* Email Header Fields */}
                <div className="border-b border-gray-200 bg-white">
                    <div className="px-4 py-2 flex items-center border-b border-gray-100">
                        <span className="text-xs text-gray-500 w-16 shrink-0">From:</span>
                        <span className="text-xs text-gray-700">elara.k832@gmail.com</span>
                    </div>
                    <div className="px-4 py-2 flex items-center border-b border-gray-100">
                        <span className="text-xs text-gray-500 w-16 shrink-0">To:</span>
                        <div className="flex-1 flex items-center gap-1 flex-wrap">
                            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">casting@agency.com</span>
                        </div>
                    </div>
                    <div className="px-4 py-2 flex items-center">
                        <span className="text-xs text-gray-500 w-16 shrink-0">Subject:</span>
                        <input 
                            type="text" 
                            value="Re: Fw: modeling submission - Elara Keats (open casting??)" 
                            readOnly
                            className="flex-1 text-xs text-gray-900 bg-transparent border-0 outline-none"
                        />
                    </div>
                </div>
                {/* Email Body - Real fragments, not performance */}
                <div className="flex-1 overflow-y-auto bg-white">
                    <div className="p-5 text-xs text-gray-700 leading-relaxed font-sans">
                        <p className="mb-3">Hi,</p>
                        <p className="mb-3">im 5'11" and my measurements are 32-25-35. my shoe is a 9. i have brown hair/green eyes.</p>
                        <p className="mb-3">My insta is @elara.k -- i post most of my new work there. im a super hard worker and everyone says im professional, i have a background in some smaller campaigns. i was with [Agency Name] last year but left, it wasnt a good fit.</p>
                        <p className="mb-3">here are some photos: <a href="#" className="text-blue-600 hover:underline break-all">https://www.google.com/search?q=https://drive.google.com/drive/folders/laBcD-THIS-I-S-A-MESSY-LINK-xyz</a></p>
                        <p className="mb-3">portfolio: <a href="#" className="text-blue-600 hover:underline break-all">https://www.google.com/search?q=elara-portfolio.wixsite.com/mysite</a></p>
                        <p className="mb-3">Let me know what you think! Thx so much!! 🙏 I'm free for a meeting basically any time next week.</p>
                                </div>
                    
                    {/* Attachments - Messy file names */}
                    <div className="px-5 pb-4 border-t border-gray-200 pt-3">
                        <div className="flex items-center gap-2 mb-2">
                            <ImageIcon size={12} className="text-gray-500"/>
                            <span className="text-[10px] text-gray-600">IMG_001.jpg, photo2.jpg, photo3.jpg, pho...</span>
                        </div>
                    </div>
                </div>
              </div>
            </BrowserWindowFrame>
          </div>

          {/* Right: Agency Reality (Browser) - Offset and cropped for realism */}
          <div className="h-full -mt-6 relative" style={{ transform: 'translateY(-8px)' }}>
            <BrowserWindowFrame label="Lost in the flood">
                <div className="w-full h-full bg-gray-50 text-gray-900 font-sans flex flex-col overflow-hidden">
                     {/* Inbox Header */}
                     <div className="h-12 bg-white border-b border-gray-200 flex items-center px-3 justify-between shrink-0">
                        <div className="flex items-center gap-2">
                            <button className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 rounded">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </button>
                            <div className="w-px h-4 bg-gray-200"></div>
                            <span className="text-xs font-medium text-gray-700">Inbox</span>
                            <span className="text-[10px] text-gray-400 ml-1">(2,842)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <input 
                                type="search" 
                                placeholder="Search" 
                                className="w-48 h-7 px-2.5 text-[10px] bg-gray-100 border-0 rounded outline-none focus:bg-white focus:ring-0.5 focus:ring-gray-300"
                            />
                        </div>
                     </div>
                     
                     {/* Email List - Hostile to narrative, not supportive */}
                     <div className="flex-1 relative bg-white">
                        <div className="absolute inset-0 overflow-y-auto" style={{ lineHeight: '1.3', paddingTop: '15px', transform: 'translateY(-20px)' }}>
                        {[
                          { sender: 'Sarah Chen', subject: 'Re: Q4 Budget Review - Action Required', preview: 'Following up on our conversation from last week...', unread: true, time: '10:42 AM', attach: true },
                          { sender: 'Fashion Week Newsletter', subject: 'Paris FW24 Highlights & Backstage Access', preview: 'Exclusive content from the shows...', unread: true, time: '10:41 AM', attach: false },
                          { sender: 'unknown.sender234@gmail.com', subject: 'casting submission', preview: 'hi attached my photos thanks', unread: true, time: '10:40 AM', attach: true },
                          { sender: 'Calendar', subject: 'Team Standup - Today 11:00 AM', preview: 'Reminder: Weekly standup meeting...', unread: true, time: '10:39 AM', attach: false },
                          { sender: 'Michael Torres', subject: 'Re: Client feedback on latest campaign', preview: 'The client wants some revisions...', unread: true, time: '10:38 AM', attach: true },
                          { sender: 'talent.submissions@gmail.com', subject: 'FW24 Model Submission', preview: 'Hello, I am submitting my portfolio...', unread: true, time: '10:37 AM', attach: true },
                          { sender: 'Industry Insider', subject: 'Breaking: New Agency Merger Announced', preview: 'Major shakeup in the industry...', unread: true, time: '10:36 AM', attach: false },
                          { sender: 'noreply@dropbox.com', subject: 'You have a new shared folder', preview: 'John Doe shared a folder with you...', unread: true, time: '10:35 AM', attach: false },
                          { sender: 'Internal Team', subject: 'Fwd: Holiday Party Details - RSVP Required', preview: 'Save the date for our annual...', unread: true, time: '10:34 AM', attach: true },
                          { sender: 'model.apply@mail.com', subject: 'Re: FW24 Casting Call', preview: 'attached my portfolio below', unread: true, time: '10:33 AM', attach: true },
                          { sender: 'Fashion Week Newsletter', subject: 'Paris FW24 Highlights & Backstage Access', preview: 'Exclusive content from the shows...', unread: true, time: '10:32 AM', attach: false },
                          { sender: 'Unknown Sender', subject: 'submission fw24', preview: 'hi here are my photos', unread: true, time: 'Yesterday', attach: true },
                          { sender: 'Calendar', subject: 'One-on-One with Director - Tomorrow', preview: 'Scheduled: 30 minute check-in...', unread: false, time: 'Yesterday', attach: false },
                          { sender: 'HR Department', subject: 'Benefits Open Enrollment - Ends Friday', preview: 'Final reminder to update your...', unread: false, time: 'Dec 24', attach: true },
                          { sender: 'talent.submissions@gmail.com', subject: 'Portfolio Submission FW24', preview: 'Hello, I am submitting my portfolio...', unread: false, time: 'Dec 24', attach: true },
                          { sender: 'Industry Insider', subject: 'Breaking: New Agency Merger Announced', preview: 'Major shakeup in the industry...', unread: false, time: 'Dec 23', attach: false },
                          { sender: 'Sarah Chen', subject: 'Re: Q4 Budget Review - Action Required', preview: 'Following up on our conversation...', unread: false, time: 'Dec 23', attach: true },
                          { sender: 'noreply@dropbox.com', subject: 'You have a new shared folder', preview: 'Someone shared a folder with you...', unread: false, time: 'Dec 22', attach: false },
                          { sender: 'model.apply@mail.com', subject: 'FW24 casting', preview: 'submitted my portfolio', unread: false, time: 'Dec 22', attach: false },
                          { sender: 'Internal Team', subject: 'Holiday Party Details - RSVP Required', preview: 'Save the date for our annual...', unread: false, time: 'Dec 21', attach: true },
                        ].map((email, i) => (
                            <div 
                              key={i} 
                              className={`border-b border-gray-100 px-3 py-2 flex items-start gap-2 hover:bg-gray-50 transition-colors cursor-pointer ${email.unread ? 'bg-blue-50/20' : ''}`}
                            >
                                <div className="pt-0.5">
                                    <input 
                                        type="checkbox" 
                                        className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-0"
                                    />
                                </div>
                                <div className="pt-1">
                                    {email.unread ? (
                                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                    ) : (
                                        <div className="w-1.5 h-1.5"></div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0" style={{ lineHeight: '1.25' }}>
                                    <div className="flex items-center justify-between mb-0.5">
                                        <span className={`text-[10px] ${email.unread ? 'text-gray-800 font-semibold' : 'text-gray-500'}`} style={{ letterSpacing: '-0.01em' }}>
                                            {email.sender}
                                        </span>
                                        <span className="text-[9px] text-gray-400 ml-2 shrink-0" style={{ letterSpacing: '0' }}>{email.time}</span>
                                    </div>
                                    <div className={`text-[10px] mb-0.5 truncate ${email.unread ? 'text-gray-800 font-medium' : 'text-gray-500'}`} style={{ letterSpacing: '-0.01em' }}>
                                        {email.subject}
                                        </div>
                                    <div className="text-[9px] text-gray-400 truncate flex items-center gap-1.5" style={{ letterSpacing: '-0.01em' }}>
                                        <span>{email.preview}</span>
                                        {email.attach && (
                                            <span className="text-gray-300 flex items-center gap-0.5 shrink-0">
                                                <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                </svg>
                                            </span>
                                        )}
                                    </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                     </div>
                     {/* Fade gradient at bottom to suggest scrolling */}
                     <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent pointer-events-none z-10"></div>
                </div>
            </BrowserWindowFrame>
          </div>

        </div>
      </div>
    </motion.section>
  );
};