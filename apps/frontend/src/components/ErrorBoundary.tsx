import { Component, type ErrorInfo, type ReactNode } from "react";

import { Button } from "./ui/button";

type State = { hasError: boolean };

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="grid min-h-screen place-items-center p-6">
          <div className="max-w-md rounded-lg border border-border bg-white p-6 text-center">
            <h1 className="text-xl font-semibold">Something went wrong</h1>
            <p className="mt-2 text-muted-foreground">Refresh the app and try again.</p>
            <Button className="mt-4" onClick={() => window.location.reload()}>
              Reload
            </Button>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
