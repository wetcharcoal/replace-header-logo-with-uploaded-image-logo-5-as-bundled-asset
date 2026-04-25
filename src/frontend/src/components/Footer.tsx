export default function Footer() {
  return (
    <footer className="bg-card border-t border-border py-6 mt-auto">
      <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
        <p>
          © {new Date().getFullYear()} Montreal Food System. All rights
          reserved.
        </p>
      </div>
    </footer>
  );
}
