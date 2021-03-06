import {Route, useHistory} from "react-router-dom";
import {
    ClassEntity,
    DocumentEntity,
    GroupEntity,
    MeasureEntity,
    ModelEntity,
    PropertyEntity,
    PropertyGroupEntity,
    UnitEntity,
    ValueEntity
} from "../domain";
import React from "react";
import CompositeCatalogEntryView from "../views/CompositeCatalogEntryView";
import DocumentForm from "../views/forms/DocumentForm";
import DomainModelForm from "../views/forms/DomainModelForm";
import DomainGroupForm from "../views/forms/DomainGroupForm";
import DomainClassForm from "../views/forms/DomainClassForm";
import PropertyGroupForm from "../views/forms/PropertyGroupForm";
import PropertyForm from "../views/forms/PropertyForm";
import ValueForm from "../views/forms/ValueForm";
import MeasureForm from "../views/forms/MeasureForm";
import UnitForm from "../views/forms/UnitForm";

const CatalogEntryRoutes = () => {
    const history = useHistory();
    const onDelete = (path: string) => history.push(`/${path}`);

    return (
        <React.Fragment>

            <Route path={`/${DocumentEntity.path}/:id?`}>
                <CompositeCatalogEntryView
                    entryType={DocumentEntity}
                    renderForm={(id => (
                        <DocumentForm
                            id={id}
                            onDelete={() => {
                                onDelete(DocumentEntity.path)
                            }}
                        />
                    ))}
                />
            </Route>

            <Route path={`/${ModelEntity.path}/:id?`}>
                <CompositeCatalogEntryView
                    entryType={ModelEntity}
                    renderForm={(id => (
                        <DomainModelForm
                            id={id}
                            onDelete={() => onDelete(ModelEntity.path)}
                        />
                    ))}
                />
            </Route>

            <Route path={`/${GroupEntity.path}/:id?`}>
                <CompositeCatalogEntryView
                    entryType={GroupEntity}
                    renderForm={(id => (
                        <DomainGroupForm
                            id={id}
                            onDelete={() => onDelete(GroupEntity.path)}
                        />
                    ))}
                />
            </Route>

            <Route path={`/${ClassEntity.path}/:id?`}>
                <CompositeCatalogEntryView
                    entryType={ClassEntity}
                    renderForm={(id => (
                        <DomainClassForm
                            id={id}
                            onDelete={() => onDelete(ClassEntity.path)}
                        />
                    ))}
                />
            </Route>

            <Route path={`/${PropertyGroupEntity.path}/:id?`}>
                <CompositeCatalogEntryView
                    entryType={PropertyGroupEntity}
                    renderForm={(id => (
                        <PropertyGroupForm
                            id={id}
                            onDelete={() => onDelete(PropertyGroupEntity.path)}
                        />
                    ))}
                />
            </Route>

            <Route path={`/${PropertyEntity.path}/:id?`}>
                <CompositeCatalogEntryView
                    entryType={PropertyEntity}
                    renderForm={(id => (
                        <PropertyForm
                            id={id}
                            onDelete={() => onDelete(PropertyEntity.path)}
                        />
                    ))}
                />
            </Route>

            <Route path={`/${MeasureEntity.path}/:id?`}>
                <CompositeCatalogEntryView
                    entryType={MeasureEntity}
                    renderForm={(id => (
                        <MeasureForm
                            id={id}
                            onDelete={() => onDelete(MeasureEntity.path)}
                        />
                    ))}
                />
            </Route>

            <Route path={`/${UnitEntity.path}/:id?`}>
                <CompositeCatalogEntryView
                    entryType={UnitEntity}
                    renderForm={(id => (
                        <UnitForm
                            id={id}
                            onDelete={() => onDelete(UnitEntity.path)}
                        />
                    ))}
                />
            </Route>

            <Route path={`/${ValueEntity.path}/:id?`}>
                <CompositeCatalogEntryView
                    entryType={ValueEntity}
                    renderForm={(id => (
                        <ValueForm
                            id={id}
                            onDelete={() => onDelete(ValueEntity.path)}
                        />
                    ))}
                />
            </Route>
        </React.Fragment>
    );
}

export default CatalogEntryRoutes;
