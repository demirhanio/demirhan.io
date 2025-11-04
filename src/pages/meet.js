const Booking = () => null;

export default Booking;

export async function getServerSideProps() {
    return {
        redirect: {
            destination: 'https://calendar.app.google/nw1FMkg7jXr1B2qUA',
            permanent: false,
        },
    };
}


