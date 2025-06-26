import React, { useState, useEffect } from "react";
import { styled } from "@mui/material/styles";
import LinearProgress from "@mui/material/LinearProgress";
import { Paper, Typography, Box, Stack } from "@mui/material";
import ThemeForm from "./forms/ThemeForm";
import DomainClassForm from "./forms/DomainClassForm";
import PropertyGroupForm from "./forms/PropertyGroupForm";
import PropertyForm from "./forms/PropertyForm";
import ValueListForm from "./forms/ValueListForm";
import UnitForm from "./forms/UnitForm";
import ValueForm from "./forms/ValueForm";
import ButtonComponent from "@mui/material/Button";
import {
  useFindPropGroupWithoutPropTreeQuery,
  useFindPropWithoutSubjectOrPropGroupTreeQuery,
  useFindThemeWithoutSubjectTreeQuery,
  useFindSubjectWithoutPropTreeQuery,
  useFindValueListWithoutPropTreeQuery,
  useFindUnitWithoutValueListTreeQuery,
  useFindValueWithoutValueListTreeQuery,
  useFindMissingEnglishNameTreeQuery,
  useFindMultipleIDsTreeQuery,
  useFindMissingDescriptionTreeQuery,
  useFindMissingEnglishDescriptionTreeQuery,
  useFindMultipleNamesTreeQuery,
  useFindMultipleNamesAcrossClassesTreeQuery,
  useFindMissingDictionaryTreeQuery,
  useFindMissingReferenceDocumentTreeQuery,
  useFindInactiveConceptsTreeQuery,
  ObjectDetailPropsFragment,
} from "../generated/types";
import {
  ClassEntity,
  DomainClassIcon,
  ThemeIcon,
  DictionaryIcon,
  getEntityType,
  ThemeEntity,
  ValueListEntity,
  MeasureIcon,
  PropertyEntity,
  PropertyGroupEntity,
  PropertyGroupIcon,
  PropertyIcon,
  UnitEntity,
  UnitIcon,
  ValueEntity,
  ValueIcon,
  DictionaryEntity,
  DocumentEntity,
  ReferenceDocumentIcon
} from "../domain";
import { T } from "@tolgee/react";
import DocumentForm from "./forms/DocumentForm";
import DictionaryForm from "./forms/DictionaryForm";
import { ListOnItemsRenderedProps } from "react-window";
import ItemList from "../components/list/ItemList";

// Replace makeStyles with styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  height: 'auto',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  overflow: 'auto',
}));

const HintTypography = styled(Typography)(({ theme }) => ({
  textAlign: "center",
  color: theme.palette.grey[600],
  padding: theme.spacing(3),
  alignSelf: 'center',
}));

// Add a styled component for left-aligned buttons
const LeftAlignedButton = styled(ButtonComponent)(({ theme }) => ({
  justifyContent: 'flex-start',
  width: '100%',
  textAlign: 'left',
}));

const verificationQueries = {
  "Themen ohne Klasse": {
    useQuery: useFindThemeWithoutSubjectTreeQuery,
    dataPath: "findThemeWithoutSubject",
    titleKey: "verification.category.no_theme_class",
    buttonGroup: "Integrität",
  },
  "Klassen ohne Merkmale/Merkmalsgruppen": {
    useQuery: useFindSubjectWithoutPropTreeQuery,
    dataPath: "findSubjectWithoutProp",
    titleKey: "verification.category.no_class_properties",
    buttonGroup: "Integrität",
  },
  "Merkmalsgruppen ohne Merkmale": {
    useQuery: useFindPropGroupWithoutPropTreeQuery,
    dataPath: "findPropGroupWithoutProp",
    titleKey: "verification.category.no_property_group",
    buttonGroup: "Integrität",
  },
  "Merkmale ohne Klasse oder Merkmalsgruppe": {
    useQuery: useFindPropWithoutSubjectOrPropGroupTreeQuery,
    dataPath: "findPropWithoutSubjectOrPropGroup",
    titleKey: "verification.category.no_property",
    buttonGroup: "Integrität",
  },
  "Wertelisten die keinem Merkmal zugeordnet sind": {
    useQuery: useFindValueListWithoutPropTreeQuery,
    dataPath: "findValueListWithoutProp",
    titleKey: "verification.category.no_valuelist",
    buttonGroup: "Integrität",
  },
  "Einheiten ohne Werteliste": {
    useQuery: useFindUnitWithoutValueListTreeQuery,
    dataPath: "findUnitWithoutValueList",
    titleKey: "verification.category.no_unit",
    buttonGroup: "Integrität",
  },
  "Werte ohne Werteliste": {
    useQuery: useFindValueWithoutValueListTreeQuery,
    dataPath: "findValueWithoutValueList",
    titleKey: "verification.category.no_value",
    buttonGroup: "Integrität",
  },
  "ID-Duplikate": {
    useQuery: useFindMultipleIDsTreeQuery,
    dataPath: "findMultipleIDs",
    titleKey: "verification.category.duplicate_id",
    buttonGroup: "Eindeutigkeit",
  },
  "Namen-Duplikate (innerhalb eines Types)": {
    useQuery: useFindMultipleNamesTreeQuery,
    dataPath: "findMultipleNames",
    titleKey: "verification.category.duplicate_name_type",
    buttonGroup: "Eindeutigkeit",
  },
  "Namen-Duplikate (gesamter Datenbestand)": {
    useQuery: useFindMultipleNamesAcrossClassesTreeQuery,
    dataPath: "findMultipleNamesAcrossClasses",
    titleKey: "verification.category.duplicate_name_all",
    buttonGroup: "Eindeutigkeit",
  },
  "Fehlende Beschreibung": {
    useQuery: useFindMissingDescriptionTreeQuery,
    dataPath: "findMissingDescription",
    titleKey: "verification.category.missing_description",
    buttonGroup: "Sprache",
  },
  "Fehlende Beschreibung (englisch)": {
    useQuery: useFindMissingEnglishDescriptionTreeQuery,
    dataPath: "findMissingEnglishDescription",
    titleKey: "verification.category.missing_description_en",
    buttonGroup: "Sprache",
  },
  "Fehlende Namens-Übersetzung (englisch)": {
    useQuery: useFindMissingEnglishNameTreeQuery,
    dataPath: "findMissingEnglishName",
    titleKey: "verification.category.missing_translation_en",
    buttonGroup: "Sprache",
  },
  "Fehlende Dictionary-Zuordnung": {
    useQuery: useFindMissingDictionaryTreeQuery,
    dataPath: "findMissingDictionary",
    titleKey: "verification.category.no_dictionary",
    buttonGroup: "Integrität",
  },
  "Fehlende Dokumenten-Zuordnung": {
    useQuery: useFindMissingReferenceDocumentTreeQuery,
    dataPath: "findMissingReferenceDocument",
    titleKey: "verification.category.no_document",
    buttonGroup: "Integrität",
  },
  "Inaktive Konzepte": {
    useQuery: useFindInactiveConceptsTreeQuery,
    dataPath: "findInactiveConcepts",
    titleKey: "verification.category.inactive_concepts",
    buttonGroup: "Integrität",
  },
};

export function VerificationView() {
  const [selectButton, setSelectButton] = useState("");
  const [selectCategory, setSelectCategory] = useState("");
  const [selectedConcept, setSelectedConcept] = useState<ObjectDetailPropsFragment | null>(null);
  const [title, setTitle] = useState<React.ReactNode>("");

  const handleOnSelect = (concept: ObjectDetailPropsFragment) => {
    setSelectedConcept(concept);
  };

  useEffect(() => {
    setSelectedConcept(null);
  }, [selectCategory, selectButton]);

  useEffect(() => {
    setSelectCategory("");
  }, [selectButton]);

  // Left column: Criteria selection
  const buttonGroups = [
    { key: "Integrität", label: "verification.criteria.integrity" },
    { key: "Eindeutigkeit", label: "verification.criteria.uniqueness" },
    { key: "Sprache", label: "verification.criteria.language" },
  ];

  const renderCriteriaButtons = () => (
    <StyledPaper>
      <Typography variant="h6">
        <T keyName="verification.title" />
      </Typography>
      <Stack direction="column" spacing={1} alignItems="stretch">
        {buttonGroups.map(group => (
          <LeftAlignedButton key={group.key} onClick={() => setSelectButton(group.key)}>
            <T keyName={group.label}>{group.key}</T>
          </LeftAlignedButton>
        ))}
      </Stack>
      <Typography variant="h6" sx={{ mt: 2 }}>
        <T keyName="verification.category_title" />
      </Typography>
      <Stack direction="column" spacing={1} alignItems="stretch">
        {Object.entries(verificationQueries)
          .filter(([_, cfg]) => cfg.buttonGroup === selectButton)
          .map(([cat, cfg]) => (
            <LeftAlignedButton key={cat} onClick={() => setSelectCategory(cat)}>
              <T keyName={cfg.titleKey}>{cat}</T>
            </LeftAlignedButton>
          ))}
      </Stack>
    </StyledPaper>
  );

  // middle column: Results
  useEffect(() => {
    const cfg = verificationQueries[selectCategory as keyof typeof verificationQueries];
    setTitle(cfg ? <T keyName={cfg.titleKey} /> : "");
  }, [selectCategory]);

  const renderResultList = () => {
    const queryConfig = verificationQueries[selectCategory as keyof typeof verificationQueries];
    if (queryConfig) {
      return (
        <GenericVerificationQuery
          useQuery={queryConfig.useQuery}
          dataPath={queryConfig.dataPath}
          onSelect={handleOnSelect}
        />
      );
    }
    return (
      <StyledPaper>
        <HintTypography variant="body1">
          <T keyName="verification.result.select_criteria" />
        </HintTypography>
      </StyledPaper>
    );
  };

  // right column: Detail view
  const entityTypeMap = {
    [ThemeEntity.path]: {
      icon: <ThemeIcon />,
      title: <T keyName="theme.edit" />,
      component: ThemeForm,
    },
    [ClassEntity.path]: {
      icon: <DomainClassIcon />,
      title: <T keyName="class.edit" />,
      component: DomainClassForm,
    },
    [PropertyEntity.path]: {
      icon: <PropertyIcon />,
      title: <T keyName="property.edit" />,
      component: PropertyForm,
    },
    [PropertyGroupEntity.path]: {
      icon: <PropertyGroupIcon />,
      title: <T keyName="propertyGroup.edit" />,
      component: PropertyGroupForm,
    },
    [ValueListEntity.path]: {
      icon: <MeasureIcon />,
      title: <T keyName="valuelist.edit" />,
      component: ValueListForm,
    },
    [UnitEntity.path]: {
      icon: <UnitIcon />,
      title: <T keyName="unit.edit" />,
      component: UnitForm,
    },
    [ValueEntity.path]: {
      icon: <ValueIcon />,
      title: <T keyName="value.edit" />,
      component: ValueForm,
    },
    [DictionaryEntity.path]: {
      icon: <DictionaryIcon />,
      title: <T keyName="dictionary.edit" />,
      component: DictionaryForm,
    },
    [DocumentEntity.path]: {
      icon: <ReferenceDocumentIcon />,
      title: <T keyName="document.edit" />,
      component: DocumentForm,
    },
    default: {
      icon: <DomainClassIcon />,
      title: <T keyName="class.edit" />,
      component: DomainClassForm,
    },
  };

  const renderDetailView = () => {
    if (!selectedConcept) {
      return (
        <HintTypography variant="body1">
          <T keyName="verification.result.select_entry" />
        </HintTypography>
      );
    }
    const { id, recordType, tags } = selectedConcept;
    const entityType = getEntityType(recordType, tags.map((x) => x.id));
    const typeConfig = entityTypeMap[entityType?.path] || entityTypeMap.default;
    const DetailComponent = typeConfig.component;
    return (
      <>
        <Typography variant="h5">
          {typeConfig.icon} {typeConfig.title}
        </Typography>
        <DetailComponent id={id} onDelete={() => setSelectedConcept(null)} />
      </>
    );
  };

  type VerificationQueryProps = {
    useQuery: (options: { variables: { pageNumber: number; pageSize: number } }) => { loading: boolean; error?: any; data?: any; fetchMore: any };
    dataPath: string;
    onSelect: (concept: ObjectDetailPropsFragment) => void;
  };

  function GenericVerificationQuery({ useQuery, dataPath, onSelect }: VerificationQueryProps) {
    const pageSize = 20;
    const { loading, error, data, fetchMore } = useQuery({ variables: { pageNumber: 0, pageSize } });

    // Lokaler State für alle geladenen Items
    const [allItems, setAllItems] = React.useState<ObjectDetailPropsFragment[]>([]);
    const [lastPage, setLastPage] = React.useState<number>(-1);

    // Items aus aktueller Page holen
    const items: ObjectDetailPropsFragment[] = (data?.[dataPath]?.nodes ?? []).slice().sort((a: { name: string; }, b: { name: any; }) => {
      if (!a.name || !b.name) return 0;
      return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
    });
    const pageInfo = data?.[dataPath]?.pageInfo;

    // Items im State zusammenführen, wenn neue Daten kommen
    React.useEffect(() => {
      if (!pageInfo) return;
      if (pageInfo.pageNumber === 0) {
        setAllItems(items);
        setLastPage(0);
      } else if (pageInfo.pageNumber > lastPage) {
        // Duplikate anhand der ID herausfiltern
        setAllItems(prev => {
          const existingIds = new Set(prev.map(item => item.id));
          const newUniqueItems = items.filter(item => !existingIds.has(item.id));
          return [...prev, ...newUniqueItems];
        });
        setLastPage(pageInfo.pageNumber);
      }
    }, [data]);

    const handleScroll = async (props: ListOnItemsRenderedProps) => {
      const { visibleStopIndex } = props;
      if (pageInfo?.hasNext && visibleStopIndex >= allItems.length - 5) {
        await fetchMore({
          variables: {
            pageSize,
            pageNumber: pageInfo.pageNumber + 1
          },
          updateQuery: (prev: any, { fetchMoreResult }: { fetchMoreResult?: any }) => {
            if (!fetchMoreResult) return prev;
            const prevNodes = prev[dataPath].nodes;
            const newNodes = fetchMoreResult[dataPath].nodes;
            // Nur eindeutige Items (nach id)
            const allNodes = [
              ...prevNodes,
              ...newNodes.filter((item: any) => !prevNodes.some((p: any) => p.id === item.id))
            ];
            return {
              ...fetchMoreResult,
              [dataPath]: {
                ...fetchMoreResult[dataPath],
                nodes: allNodes,
                pageInfo: fetchMoreResult[dataPath].pageInfo
              }
            };
          }
        });
      }
    }

    if (loading && pageInfo?.pageNumber === 0) return <LinearProgress />;
    if (error) return <p><T keyName="verification.error" /></p>;
    if (!loading && (!allItems || allItems.length === 0)) {
      return <p><T keyName="verification.no_data" /></p>;
    }
    return (
      <Box>
        <ItemList
          loading={loading}
          items={allItems}
          searchLabel={<T keyName="search.search_placeholder" />}
          onItemsRendered={handleScroll}
          height={500}
          onSelect={onSelect}
        />
      </Box>
    );
  }

  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{
        minHeight: 'calc(100vh - 140px)',
        width: '100%',
        alignItems: 'flex-start' // Align items to the top
      }}
    >
      {/* Left column - Criteria */}
      <Box sx={{
        width: '20%',
        flexShrink: 0,
        alignSelf: 'flex-start' // Don't stretch vertically
      }}>
        {renderCriteriaButtons()}
      </Box>

      {/* Middle column - Results */}
      <Box sx={{
        width: '30%',
        flexShrink: 0,
        alignSelf: 'flex-start' // Don't stretch vertically
      }}>
        <StyledPaper>
          <Typography variant="h6">{title}</Typography>
          <Box sx={{
            flexGrow: title ? 1 : 0,
            display: 'flex',
            flexDirection: 'column'
          }}>
            {renderResultList()}
          </Box>
        </StyledPaper>
      </Box>

      {/* Right column - Details */}
      <Box sx={{
        flexGrow: 1,
        alignSelf: 'flex-start', // Don't stretch vertically
        minHeight: !selectedConcept ? 'auto' : undefined
      }}>
        <StyledPaper>
          {renderDetailView()}
        </StyledPaper>
      </Box>
    </Stack>
  );
}

export default VerificationView;
