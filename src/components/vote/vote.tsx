import { Eliminate } from "./elimanate";
import { Footer } from "./footer";
import { Header } from "./header";

export function Vote() {
    return (
        <div className="bg-[url('/Background.jpg')] bg-cover bg-no-repeat w-full h-screen flex justify-center px-3 md:px-0">
            <div className="w-full max-w-[1440px]">
                <Header />
                <Eliminate />
                <Footer />
            </div>
        </div>
    )
}