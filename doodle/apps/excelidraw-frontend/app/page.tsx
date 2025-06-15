"use client";

import { Button } from "@repo/ui/button";
import { Card } from "@repo/ui/card";
import { Share2, Users2, Sparkles, Github, Download } from "lucide-react";
import Link from "next/link";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const handleOpenCanvas = () => {
    toast.success("Opening canvas...", {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  const handleViewGallery = () => {
    toast.info("Gallery coming soon!", {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/40 to-background text-foreground">
        {/* Hero Section */}
        <header className="relative overflow-hidden bg-gradient-to-b from-primary/10 to-transparent">
          <div className="container mx-auto px-4 py-20 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-5xl sm:text-6xl font-extrabold leading-tight tracking-tight drop-shadow-sm">
                Collaborative Whiteboarding
                <span className="text-primary block drop-shadow-[0_0_12px_rgba()]">
                  Made Simple
                </span>
              </h1>
              <p className="mt-6 text-lg sm:text-xl text-muted-foreground">
                Create, collaborate, and share beautiful diagrams and sketches
                with our intuitive drawing tool. No sign-up required.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-4 flex-wrap">
                <Link href="/signin">
                  <Button variant="primary" size="lg" className="h-12 px-6">
                    Get Started
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button variant="outline" size="lg" className="h-12 px-6">
                    Sign up
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Features Section */}
        <div className="px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Real-time Collaboration",
                description:
                  "Work together with your team in real-time. Share your drawings instantly with a simple link.",
                icon: <Share2 className="h-6 w-6 text-primary" />,
              },
              {
                title: "Multiplayer Editing",
                description:
                  "Multiple users can edit the same canvas simultaneously. See who's drawing what in real-time.",
                icon: <Users2 className="h-6 w-6 text-primary" />,
              },
              {
                title: "Smart Drawing",
                description:
                  "Intelligent shape recognition and drawing assistance helps you create perfect diagrams.",
                icon: <Sparkles className="h-6 w-6 text-primary" />,
              },
            ].map((item, index) => (
              <Card key={index} title={item.title}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    {item.icon}
                  </div>
                </div>
                <p>{item.description}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <section className="py-24 bg-gradient-to-r from-primary/20 via-transparent to-primary/10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl border border-primary/30 bg-primary/10 backdrop-blur-md p-10 sm:p-16 shadow-lg">
              <div className="mx-auto max-w-2xl text-center">
                <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
                  Ready to start creating?
                </h2>
                <p className="mt-6 text-lg text-primary-foreground/80">
                  Join thousands of users already sketching and building their
                  ideas.
                </p>
                <div className="mt-10 flex flex-wrap justify-center gap-4">
                  <Button
                    size="lg"
                    variant="primary"
                    className="h-12 px-6"
                    onClick={handleOpenCanvas}
                  >
                    Open Canvas
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-12 px-6 border-white text-white hover:bg-white hover:text-primary"
                    onClick={handleViewGallery}
                  >
                    View Gallery
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-muted bg-background/90 backdrop-blur-md">
          <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                © 2025 Droodle. All rights reserved.
              </p>
              <div className="flex gap-4">
                <a
                  href="https://github.com"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <Download className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        toastClassName="bg-card text-card-foreground border border-border"
      />
    </>
  );
}

export default App;
