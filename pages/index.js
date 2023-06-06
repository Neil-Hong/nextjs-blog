import Head from "next/head";
import Layout, { siteTitle } from "../components/layout";
import utilStyles from "../styles/utils.module.css";
import { getSortedPostsData } from "../lib/posts";
import { FGStorage } from "@co2-storage/js-api";
import Link from "next/link";
import Date from "../components/date";
import { useEffect, useState } from "react";

export default function Home({ allPostsData }) {
    const authType = "metamask";
    const ipfsNodeType = "browser";
    const ipfsNodeAddr = "/dns4/web2.co2.storage/tcp/5002/https";
    const fgApiUrl = "https://web2.co2.storage";

    const fgStorage = new FGStorage({
        authType: authType,
        ipfsNodeType: ipfsNodeType,
        ipfsNodeAddr: ipfsNodeAddr,
        fgApiHost: fgApiUrl,
    });

    const [data, setData] = useState(null);
    const [id, setId] = useState(null);
    const [createdAt, setCreatedAt] = useState(null);
    const [temperature, setTemperature] = useState(null);
    const [pressure, setPressure] = useState(null);
    const [humidity, setHumidity] = useState(null);
    const [altitude, setAltitude] = useState(null);
    const [methane, setMethane] = useState(null);
    const [carbonMonoxide, setCarbonMonoxide] = useState(null);
    const [carbonDioxide, setCarbonDioxide] = useState(null);
    const [totalEmissions, setTotalEmissions] = useState(null);

    useEffect(() => {
        data &&
            data.feeds.map((feed, index) => {
                setId(feed.entry_id);
                setCreatedAt(feed.created_at);
                setTemperature(feed.field1);
                setPressure(feed.field2);
                setHumidity(feed.field3);
                setAltitude(feed.field4);
                setMethane(feed.field6);
                setCarbonMonoxide(feed.field6);
                setCarbonDioxide(feed.field7);
                setTotalEmissions(feed.field8);
            });
    }, [data]);

    const fetchData = async () => {
        const result = await axios.get("https://api.thingspeak.com/channels/1803223/feeds.json?results=1");

        setData(result.data);
        console.log(result.data);
    };

    async function SearchTemplates() {
        /**
         * Search templates
         * parameters: (chainName, phrases, cid, name, base, account, offset, limit, sortBy, sortDir)
         * // default data_chain: 'sandbox', phrases: null, cid: null, name: null, base: null, account: null, offset: 0, limit: 10
         */

        let searchTemplatesResponse = await fgStorage.searchTemplates("sandbox"); // ('SP Audits', 'Water')
        if (searchTemplatesResponse.error != null) {
            console.error(searchTemplatesResponse.error);
            // await new Promise(reject => setTimeout(reject, 300));
            // process.exit()
        }

        console.log(searchTemplatesResponse.result);
    }

    const assetElements = [
        {
            name: "Id",
            value: id,
        },
        {
            name: "Created At",
            value: createdAt,
        },
        {
            name: "Temperature",
            value: temperature,
        },
        {
            name: "Pressure",
            value: pressure,
        },
        {
            name: "Humidity",
            value: humidity,
        },
        {
            name: "Altitude",
            value: altitude,
        },
        {
            name: "Methane",
            value: methane,
        },
        {
            name: "Carbon Monoxide",
            value: carbonMonoxide,
        },
        {
            name: "Carbon Dioxide",
            value: carbonDioxide,
        },
        {
            name: "Total Emissions Per hour",
            value: totalEmissions,
        },
    ];

    async function AddAsset() {
        let addAssetResponse = await fgStorage.addAsset(
            assetElements,
            {
                parent: null,
                name: "Asset from ChemotronV2",
                description: "Carbon data",
                template: "bafyreid2xwmqdt7hr6ay7xbrpftq64zdazszcw7dzjf7423q2rzygnbftm", // CID of above template
                filesUploadStart: () => {
                    console.log("Upload started");
                },
                filesUploadEnd: () => {
                    console.log("Upload finished");
                },
                createAssetStart: () => {
                    console.log("Creating asset");
                },
                createAssetEnd: () => {
                    console.log("Asset created");
                },
            },
            "sandbox"
        );
        if (addAssetResponse.error != null) {
            console.error(addAssetResponse.error);
            await new Promise((reject) => setTimeout(reject, 300));
            process.exit();
        }

        console.dir(addAssetResponse.result, { depth: null });

        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Exit program
        // process.exit()
    }

    return (
        <Layout home>
            <Head>
                <title>{siteTitle}</title>
            </Head>
            <button onClick={AddAsset}>search</button>
            <section className={utilStyles.headingMd}>
                <p>[Your Self Introduction]</p>
                <p>
                    (This is a sample website - you’ll be building a site like this in{" "}
                    <a href="https://nextjs.org/learn">our Next.js tutorial</a>.)
                </p>
            </section>
            <section className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>
                <h2 className={utilStyles.headingLg}>Blog</h2>
                <ul className={utilStyles.list}>
                    {allPostsData.map(({ id, date, title }) => (
                        <li className={utilStyles.listItem} key={id}>
                            <Link href={`/posts/${id}`}>{title}</Link>
                            <br />
                            <small className={utilStyles.lightText}>
                                <Date dateString={date} />
                            </small>
                        </li>
                    ))}
                </ul>
            </section>
        </Layout>
    );
}

export async function getStaticProps() {
    const allPostsData = getSortedPostsData();
    return {
        props: {
            allPostsData,
        },
    };
}
