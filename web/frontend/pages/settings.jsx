import {
    Card,
    Page,
    Layout,
    TextContainer,
    Image,
    Stack,
    Link,
    Text,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useTranslation, Trans } from "react-i18next";

import { trophyImage } from "../assets";

import { KeysCard } from "../components/KeysCard";

export default function Settings() {
    const { t } = useTranslation();
    return (
        <Page narrowWidth>
            <TitleBar title={"App Settings"} primaryAction={null} />
            <Layout>
                <Layout.Section>
                    <KeysCard />
                </Layout.Section>
            </Layout>
        </Page>
    );
}
