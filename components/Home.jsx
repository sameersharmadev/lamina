'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
    FolderTree, 
    Edit3, 
    FileStack,
    Settings, 
    Code, 
    ArrowRight, 
    Infinity
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
    const router = useRouter();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    // Updated features with 6 items and more subtle, modern colors
    const features = [
        {
            icon: <Edit3 className="w-6 h-6" />,
            title: "WYSIWYG Editor",
            description: "What-you-see-is-what-you-get editing experience.",
            bg: "bg-gradient-to-br from-[#232a3b] to-[#1a1f2b]"
        },
        {
            icon: <FolderTree className="w-6 h-6" />,
            title: "Better File Structure Than Notion",
            description: "Superior file organization that makes sense.",
            bg: "bg-gradient-to-br from-[#1e2b23] to-[#19221a]"
        },
        {
            icon: <Code className="w-6 h-6" />,
            title: "Markdown Editing",
            description: "Full markdown support for rich text formatting.",
            bg: "bg-gradient-to-br from-[#2a233b] to-[#1f1a2b]"
        },
        {
            icon: <FileStack className="w-6 h-6" />,
            title: "Tab System for Notes",
            description: "Open multiple notes in tabs for easy switching.",
            bg: "bg-gradient-to-br from-[#3b2a23] to-[#2b1f1a]"
        },
        {
            icon: <Settings className="w-6 h-6" />,
            title: "Excellent Customization",
            description: "Customize every aspect of your workspace.",
            bg: "bg-gradient-to-br from-[#233b2a] to-[#1a2b1f]"
        },
        {
            icon: <Infinity className="w-6 h-6" />,
            title: "Unlimited Notes",
            description: "Create as many notes as you need, without limits.",
            bg: "bg-gradient-to-br from-[#23233b] to-[#1a1a2b]"
        }
    ];

    return (
        <div className="min-h-screen bg-[#101010] text-white">
            {/* Navigation */}
            <nav className="border-b border-gray-800 bg-[#101010]/95 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 text-primary-foreground flex items-center justify-center font-bold shadow-lg">
                                L
                            </div>
                            <span className="text-xl font-bold">Lamina</span>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <Link href="/login">
                                <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-gray-800">Sign In</Button>
                            </Link>
                            <Link href="/login">
                                <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg">
                                    Get Started
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative overflow-hidden bg-[#101010]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
                    <div className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                        <Badge variant="secondary" className="mb-6 bg-primary/10 border-primary/20 text-primary">
                            What a Note-Taking App Should Be
                        </Badge>
                        
                        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 text-white">
                            Simple Note-Taking
                            <br />
                            That{' '}
                            <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                                Works
                            </span>
                        </h1>
                        
                        <p className="text-xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
                            Lamina offers WYSIWYG editing, better file structure than Notion, markdown support, tabs for notes, excellent customization, and unlimited notes.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                            <Link href="/login">
                                <Button size="lg" className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-xl hover:shadow-2xl transition-all duration-300">
                                    Start Taking Notes
                                    <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                            </Link>
                        </div>
                        
                        {/* Dashboard Preview with fade effect */}
                        <div className="mt-16 relative flex justify-center">
                            <div className="relative w-full max-w-6xl mx-auto">
                                {/* intensified layered white glow behind image */}
                                <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
                                    {/* largest soft halo */}
                                    <div
                                        style={{
                                            position: 'absolute',
                                            left: '50%',
                                            top: '6%',
                                            width: '220%',
                                            height: '120%',
                                            transform: 'translateX(-50%) translateY(-8%)',
                                            background:
                                                'radial-gradient(closest-side at 50% 12%, rgba(255,255,255,0.75), rgba(255,255,255,0.45) 20%, rgba(255,255,255,0.12) 45%, transparent 75%)',
                                            filter: 'blur(140px)',
                                            opacity: 0.95,
                                        }}
                                    />

                                    {/* stronger inner glow to make image pop */}
                                    <div
                                        style={{
                                            position: 'absolute',
                                            left: '50%',
                                            top: '12%',
                                            width: '120%',
                                            height: '72%',
                                            transform: 'translateX(-50%) translateY(-4%)',
                                            background:
                                                'radial-gradient(closest-side at 50% 10%, rgba(255,255,255,0.9), rgba(255,255,255,0.6) 24%, rgba(255,255,255,0.18) 48%, transparent 80%)',
                                            filter: 'blur(44px)',
                                            opacity: 0.95,
                                        }}
                                    />

                                    {/* subtle side fills to extend glow left/right */}
                                    <div
                                        style={{
                                            position: 'absolute',
                                            left: '50%',
                                            top: '20%',
                                            width: '120%',
                                            height: '40%',
                                            transform: 'translateX(-50%)',
                                            background:
                                                'linear-gradient(90deg, rgba(255,255,255,0.06), rgba(255,255,255,0.16), rgba(255,255,255,0.06))',
                                            filter: 'blur(60px)',
                                            opacity: 0.9,
                                        }}
                                    />
                                </div>

                                <Image
                                    src="/dashboard-preview.png"
                                    alt="Lamina Dashboard Preview"
                                    width={1200}
                                    height={800}
                                    className="w-full h-auto relative z-20"
                                    priority
                                    style={{ display: 'block' }}
                                />
 
                                 {/* Fade effect overlay (fade down) */}
                                 <div
                                     className="pointer-events-none absolute left-0 right-0 bottom-0 h-32 z-30"
                                     style={{
                                         background: "linear-gradient(to bottom, rgba(16,16,16,0) 0%, #101010 100%)"
                                     }}
                                 />
                             </div>
                         </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 bg-[#101010]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-white">
                            Features
                        </h2>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                            Everything you need for organized note-taking.
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <Card 
                                key={index} 
                                className={`group border-0 ${feature.bg} hover:brightness-110 hover:scale-[1.03] transition-all duration-400 shadow-lg`}
                            >
                                <CardContent className="p-8">
                                    <div className="w-14 h-14 rounded-xl bg-[#181818] flex items-center justify-center mb-6 text-white shadow-md group-hover:shadow-xl transition-shadow duration-300">
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2 text-white">{feature.title}</h3>
                                    <p className="text-gray-300 leading-relaxed">{feature.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-[#101010]">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-8 text-white">
                        Ready to get started?
                    </h2>
                    <p className="text-xl text-gray-400 mb-12 leading-relaxed">
                        Start organizing your notes with Lamina today.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-6 justify-center">
                        <Link href="/login">
                            <Button size="lg" className="text-lg px-12 py-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-xl hover:shadow-2xl transition-all duration-300">
                                Get Started Free
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-gray-800 py-16 bg-[#101010]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground flex items-center justify-center font-bold shadow-lg">
                                L
                            </div>
                            <span className="text-2xl font-bold text-white">Lamina</span>
                        </div>
                        <p className="text-gray-400 mb-8">
                            Simple note-taking with file organization.
                        </p>
                        <p className="text-gray-400">&copy; 2025 Lamina. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}