import { useState } from "react";
import { LegacyCard, Text, FormLayout, TextField } from "@shopify/polaris";
import { Toast } from "@shopify/app-bridge-react";
import { useTranslation } from "react-i18next";
import { useAuthenticatedFetch } from "../hooks";

export function KeysCard() {
    const emptyToastProps = { content: null };
    const [isLoading, setIsLoading] = useState(false);
    const [toastProps, setToastProps] = useState(emptyToastProps);
    const [apiKey, setApiKey] = useState("");
    const [clientId, setClientId] = useState("");
    const fetch = useAuthenticatedFetch();

    const { t } = useTranslation();

    const toastMarkup = toastProps.content && (
        <Toast
            {...toastProps}
            onDismiss={() => setToastProps(emptyToastProps)}
        />
    );

    function resetForm() {
        setClientId("");
        setApiKey("");
        removeStyleFromNode("api_key");
        removeStyleFromNode("client_id");
    }

    function highlightEmptyNode(node) {
        let elm = document.getElementsByName(node);
        elm[0].style.borderColor = "red";
    }

    function removeStyleFromNode(node) {
        let elm = document.getElementsByName(node);
        elm[0].style.borderColor = null;
    }

    const saveHandler = () => {
        if (apiKey == "") {
            highlightEmptyNode("api_key");
            removeStyleFromNode("client_id");
        } else if (clientId == "") {
            highlightEmptyNode("client_id");
            removeStyleFromNode("api_key");
        } else {
            setIsLoading(true);

            const url = "api/oshi/client-validate";

            const requestOptions = {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ apiKey: apiKey, clientId: clientId }),
            };

            fetch(url, requestOptions)
                .then((response) => response.json())
                .then((data) => {
                    console.log(data);
                    if (data.success) {
                        setToastProps({
                            content: "Credentials saved successfully",
                        });
                    } else {
                        setToastProps({
                            content: "Token or client is not correct",
                            error: true,
                        });
                    }
                    setIsLoading(false);
                    resetForm();
                })
                .catch((error) => {
                    setIsLoading(false);
                    resetForm();
                    setToastProps({
                        content: "something wrong",
                        error: true,
                    });
                });
        }
    };

    return (
        <>
            {toastMarkup}
            <LegacyCard
                title="App Credentials"
                sectioned
                primaryFooterAction={{
                    content: "Save",
                    onAction: saveHandler,
                    loading: isLoading,
                }}
            >
                <FormLayout>
                    <TextField
                        type="text"
                        name="api_key"
                        value={apiKey}
                        label={"TOKEN"}
                        onChange={(val) => setApiKey(val)}
                        autoComplete="off"
                    />
                    <TextField
                        type="text"
                        name="client_id"
                        value={clientId}
                        label={"Client ID"}
                        onChange={(val) => setClientId(val)}
                        autoComplete="off"
                    />
                </FormLayout>
            </LegacyCard>
        </>
    );
}
