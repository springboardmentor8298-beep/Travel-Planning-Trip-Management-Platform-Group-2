import puri from "../assets/destinations/puri.jpg";
import digha from "../assets/destinations/digha.jpg";
import goa from "../assets/destinations/goa.jpg";
import darjeeling from "../assets/destinations/darjeeling.jpg";
import kolkata from "../assets/destinations/kolkata.jpg";
import defaultImage from "../assets/destinations/default.jpg";

const images = {
    puri: puri,
    digha: digha,
    goa: goa,
    darjeeling: darjeeling,
    kolkata: kolkata
};

export function getTripImage(destination) {

    if (!destination) {
        return defaultImage;
    }

    return images[destination.toLowerCase()] || defaultImage;

}