import {
    IndexTable,
    LegacyCard,
    useIndexResourceState,
    Text,
    Layout,
    Page,
    Spinner,
    Select,
    TextField,
    Checkbox,
    Button,
    LegacyStack,
} from "@shopify/polaris";

import { useState, useEffect } from "react";
import { TitleBar } from "@shopify/app-bridge-react";
import { useTranslation } from "react-i18next";
import { useAuthenticatedFetch } from "../hooks";
import { Toast } from "@shopify/app-bridge-react";
import { useSearchParams } from "react-router-dom";
import "./Index.css";

const HomePage = () => {
    const emptyToastProps = { content: null };
    const [toastProps, setToastProps] = useState(emptyToastProps);
    const { t } = useTranslation();

    const [isLoading, setIsLoading] = useState(true);
    const [isBooking, setIsBooking] = useState(false);
    const [showNotification, setShowNotification] = useState(false);
    const [globalShipper, setGlobalShipper] = useState("");

    const toastMarkup = toastProps.content && (
        <Toast
            {...toastProps}
            onDismiss={() => setToastProps(emptyToastProps)}
        />
    );

    const fetch = useAuthenticatedFetch();

    const [orders, setOrders] = useState([]);
    const [cities, setCities] = useState([]);
    const [shippers, setShippers] = useState([]);

    const { selectedResources, allResourcesSelected, handleSelectionChange } =
        useIndexResourceState(orders);

    const [searchParams, setSearchParams] = useSearchParams();
    const [rowData, setRowData] = useState([]);

    useEffect(() => {
        const ids = searchParams.getAll("ids[]").toString();
        fetchOrders(ids);
    }, []);

    function fetchOrders(ids) {
        const SHOPIFY_ORDERS_LIST = "api/shopify/orders";
        const url = SHOPIFY_ORDERS_LIST + "?ids=" + ids;
        fetch(url, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        })
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                if (ids != "") {
                    console.log(data);
                    setCities(data.cities);
                    setShippers(data.shippers);
                    setOrders(data.orders);
                    setRowData(data.orders);
                    setIsLoading(false);
                }
            });
        //     .catch((error) => {});
    }

    const resourceName = {
        singular: "order",
        plural: "orders",
    };

    const handlePushOrder = () => {
        setIsBooking(true);

        const isCityMissing = rowData.some(
            (obj) => !obj.hasOwnProperty("city"),
        );
        const isShipperMissing = rowData.some(
            (obj) => !obj.hasOwnProperty("shipper"),
        );

        if (isCityMissing) {
            setToastProps({
                content: "Missing City",
                error: true,
            });
            setIsBooking(false);
        } else if (isShipperMissing) {
            setToastProps({
                content: "Missing Shipper",
                error: true,
            });
            setIsBooking(false);
        } else {
            const PUSH_ORDER = "api/oshi/push-order";
            const url = PUSH_ORDER;
            fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ body: rowData }),
            })
                .then((response) => response.json())
                .then((data) => {
                    console.log("response");
                    console.log(data);
                    if (data) {
                        // setToastProps({
                        //     content: "Orders has been pushed",
                        // });
                        setIsBooking(false);
                        setShowNotification(true);
                    }
                })
                .catch((error) => {});
        }
    };

    const handleRowDataChange = (index, fieldName, value) => {
        const updatedRowData = [...rowData];
        updatedRowData[index] = {
            ...updatedRowData[index],
            [fieldName]: value,
        };
        setRowData(updatedRowData);
    };

    const handleTrackOrder = () => {};

    function removeRowOption(indexToRemove) {
        let newRowData = rowData.filter((_, index) => index !== indexToRemove);
        console.log(newRowData);
        setOrders(newRowData);
        setRowData(newRowData);
    }

    const handleGlobalShipper = (value) => {
        setGlobalShipper(value);
    };

    const applyGlobalShipper = () => {
        let updatedRowData = [...rowData];
        orders.map((item, index) => {
            updatedRowData[index] = {
                ...updatedRowData[index],
                shipper: globalShipper,
            };
        });

        setRowData(updatedRowData);

        console.log(updatedRowData);
    };

    const rowMarkup = orders.map(({ id, name }, index) => (
        <IndexTable.Row id={id} key={id} position={index}>
            <IndexTable.Cell>
                <Text variant="bodyMd" fontWeight="bold" as="span">
                    {name}
                </Text>
            </IndexTable.Cell>
            <IndexTable.Cell>
                <TextField
                    type="text"
                    value={rowData[index] ? rowData[index].phone : ""}
                    onChange={(e) => handleRowDataChange(index, "phone", e)}
                    autoComplete="off"
                />
            </IndexTable.Cell>
            <IndexTable.Cell>
                <TextField
                    type="text"
                    value={rowData[index] ? rowData[index].address : ""}
                    onChange={(e) => handleRowDataChange(index, "address", e)}
                    autoComplete="off"
                    multiline={2}
                />
            </IndexTable.Cell>
            <IndexTable.Cell>
                <Select
                    options={cities}
                    onChange={(e) => handleRowDataChange(index, "city", e)}
                    value={rowData[index] ? rowData[index].city : ""}
                />
            </IndexTable.Cell>
            <IndexTable.Cell>
                <Select
                    options={shippers}
                    onChange={(e) => handleRowDataChange(index, "shipper", e)}
                    value={rowData[index] ? rowData[index].shipper : ""}
                />
            </IndexTable.Cell>
            {/* <IndexTable.Cell>
                <TextField
                    onChange={(e) =>
                        handleRowDataChange(index, "description", e)
                    }
                    value={rowData[index] ? rowData[index].description : ""}
                    multiline={2}
                    autoComplete="off"
                />
            </IndexTable.Cell> */}
            <IndexTable.Cell>
                <TextField
                    type="number"
                    value={rowData[index] ? rowData[index].amount : ""}
                    onChange={(e) => handleRowDataChange(index, "amount", e)}
                    autoComplete="off"
                />
            </IndexTable.Cell>
            <IndexTable.Cell>
                <TextField
                    type="number"
                    value={rowData[index] ? rowData[index].weight : "0.5"}
                    onChange={(e) => handleRowDataChange(index, "weight", e)}
                    autoComplete="off"
                />
            </IndexTable.Cell>
            <IndexTable.Cell>
                <Checkbox
                    checked={rowData[index] ? rowData[index].parcel : false}
                    onChange={(e) => handleRowDataChange(index, "parcel", e)}
                />
            </IndexTable.Cell>
            <IndexTable.Cell>
                {" "}
                <span
                    onClick={() => removeRowOption(index)}
                    className="removeOption"
                >
                    X
                </span>{" "}
            </IndexTable.Cell>
        </IndexTable.Row>
    ));
    return isLoading ? (
        <Spinner />
    ) : (
        <>
            {showNotification ? (
                <Page>
                    <LegacyStack vertical spacing="extraTight">
                        <div className="notification-bar">
                            Orders has been pushed to oshi
                            <span onClick={() => setShowNotification(false)}>
                                X
                            </span>
                        </div>
                    </LegacyStack>
                </Page>
            ) : null}
            <Page>
                <LegacyStack vertical spacing="extraTight">
                    <Select
                        label="Select Shipper"
                        options={shippers}
                        onChange={handleGlobalShipper}
                        value={globalShipper}
                    />
                    <Button onClick={applyGlobalShipper}>Apply</Button>
                </LegacyStack>
            </Page>
            <Page fullWidth>
                {toastMarkup}
                <TitleBar
                    title={t("Orders.title")}
                    primaryAction={{
                        content: "Book Order(s)",
                        onAction: handlePushOrder,
                        loading: isBooking,
                    }}
                    // secondaryActions={[
                    //     {
                    //         content: "",
                    //         onAction: () => handleTrackOrder,
                    //     },
                    // ]}
                />
                <Layout>
                    <Layout.Section>
                        <LegacyCard>
                            <IndexTable
                                resourceName={resourceName}
                                itemCount={orders.length}
                                selectedItemsCount={
                                    allResourcesSelected
                                        ? "All"
                                        : selectedResources.length
                                }
                                selectable={false}
                                onSelectionChange={handleSelectionChange}
                                headings={[
                                    { title: "Name" },
                                    { title: "Consignee Phone" },
                                    { title: "Consignee Address" },
                                    { title: "Consignee City" },
                                    { title: "Shipper" },
                                    // { title: "Item Description" },
                                    { title: "Amount" },
                                    { title: "Weight" },
                                    { title: "Is OPEN" },
                                    { title: "Action" },
                                ]}
                            >
                                {isLoading ? <Spinner /> : rowMarkup}
                            </IndexTable>
                        </LegacyCard>
                    </Layout.Section>
                </Layout>
            </Page>
        </>
    );
};

export default HomePage;
