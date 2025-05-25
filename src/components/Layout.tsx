import AuthNav from './AuthNav';

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="lg:pl-20 bg-light-primary dark:bg-dark-primary min-h-screen">
      <AuthNav />
      <div className="max-w-screen-lg lg:mx-auto mx-4 pt-12">{children}</div>
    </main>
  );
};

export default Layout;
