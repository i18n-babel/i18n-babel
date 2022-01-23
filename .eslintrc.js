module.exports = {
    "root": true,
    "parser": "@typescript-eslint/parser",
    "plugins": [
        "import",
        "@typescript-eslint",
        // "prettier"
    ],
    "extends": [
        "airbnb-typescript",
        "airbnb/hooks",
        // "prettier",
        "plugin:@typescript-eslint/recommended",
        "plugin:import/errors",
        "plugin:import/warnings",
        "plugin:import/typescript",
        // "plugin:prettier/recommended"
    ],
    "parserOptions": {
        "sourceType": "module",
        "ecmaFeatures": {
            "jsx": true
        },
        "ecmaVersion": 6,
        "project": "./tsconfig.json"
    },
    "env": {
        "browser": true,
        "node": true,
        "es6": true,
        "mongo": true
    },
    "rules": {
        "strict": [2, "never"],
        "indent": ["error", 4, { "SwitchCase": 1, "VariableDeclarator": { "var": 4, "let": 4, "const": 4 } }],
        "@typescript-eslint/indent": ["error", 4, { "SwitchCase": 1, "VariableDeclarator": { "var": 4, "let": 4, "const": 4 } }],
        "quotes": ["error", "single"],
        "no-underscore-dangle": [1, { "allow": ["_id"] }],
        "max-len": ["warn", 150],
        "complexity": ["warn", 12],
        "arrow-parens": ["error", "as-needed", { "requireForBlockBody": true }],
        // "sort-imports": ["error", {
        //     "ignoreCase": false,
        //     "ignoreDeclarationSort": false,
        //     "ignoreMemberSort": false,
        //     "memberSyntaxSortOrder": ["none", "all", "multiple", "single"],
        //     "allowSeparatedGroups": false
        // }],
        // "member-ordering": ["warn", true, {
        //     "order": [
        //         "static-field",
        //         "instance-field",
        //         "static-method",
        //         "instance-method"
        //     ]
        // }],
        "@typescript-eslint/explicit-module-boundary-types": 0,
        "no-console": 1,
        // "prettier/prettier": ["error", { "singleQuote": true }],
        "import/prefer-default-export": 0,
        "import/no-extraneous-dependencies": 1,
        "import/order":["error", {
            "groups": ["builtin", "external", "internal"],
            "newlines-between": "always",
            "alphabetize": { "order": "asc", "caseInsensitive": true }
        }],
        "@typescript-eslint/no-explicit-any": 0,
        "@typescript-eslint/lines-between-class-members": 0,
        "object-curly-newline": 0,
        "object-property-newline": 0,
        "no-return-assign": ["error", "except-parens"],
        "class-methods-use-this": 0,
        "react/react-in-jsx-scope": 0,
        "react/jsx-indent": 0,
        "react/jsx-indent-props": 0,
        "react/no-unknown-property": 0,
        "react/prop-types": 0,
        "react/jsx-one-expression-per-line": 0,
        "react/jsx-props-no-spreading": 0,
    },
    "settings": {
        "import/resolver": {
            "babel-module": {},
            "node": {
                "extensions": [".js", ".jsx", ".ts", ".tsx"],
                "moduleDirectory": ["node_modules", "src/"]
            },
            "typescript": {
                "alwaysTryTypes": true
            }
        }
    }
};
